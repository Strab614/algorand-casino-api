package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/algo"
	"github.com/algo-casino/payapi/postgres"
	"github.com/algo-casino/payapi/slack"
	"github.com/algo-casino/payapi/stake"
	"github.com/algo-casino/payapi/utils"
	"github.com/go-co-op/gocron"
	_ "github.com/go-sql-driver/mysql"
)

type targetAsset struct {
	name    string // known name of the pool
	assetId uint64 // algorand asa id
}

var (
	connectionString string

	// addresses faucet snapshots should ignore
	faucetDenylist = []string{
		"34UK57GUXQJS7RQVGGQOKSCFCVD5XWP4RQIQN5S723C5AR37BWBRFWWSHA", // tinyman pool v1.1
		"ZCG3G65JJJ24GQQP2DWLA34J3TMHEXATMUOOGM2SBGIPMI7HAIOTAPWLIA", // CHIPS reserve wallet
		"TVFMM3ZTK3QJM2BT5AZ4O3VIU4XMODAGWJ2AMAJ64OI55NO5DLHXS4ADTY", // tinyman pool v2
		// additional liquid target pools addr here
		"7SBVRVLGSF3YRSPBF7JRJ53VVT6OCZKVF4P4JLV6FO46FO5HDYWZ4BLNFM", // cALGO/chip pool
		"CIVR6YRD6CLIAVN46HMEVRQWZUH64MSISD7QG4PAZHHN3EHZ3MJGFC7O7Y", // tALGO/chip pool
		"5WKEIEVDVI7JVYKNOILKB5V2BKCWM6O7V7YDTFTXBEDNGBRJ5ANXMCRP6M", // mALGO/chip pool
		"2KCXZDN66RWLGQBM74A5B3EHVOSX2I24A2KEY7O2IGVHHZEA5UYU6LQXV4", // xALGO/chip pool
	}

	// additional targets
	liquidTargets = []targetAsset{
		{"TM cALGO/chip", 2562903034},
		{"TM tALGO/chip", 2545480441},
		{"TM mALGO/chip", 2536627349},
		{"TM xALGO/chip", 2520645026},
	}
)

func init() {
	// Create postgres connection string from environment variables
	connectionString = fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s",
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASS"),
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_PORT"),
		os.Getenv("POSTGRES_DB"),
	)
}

func connectToStake() (*sql.DB, error) {
	stakeConnString := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s",
		utils.MustGetEnv("STAKE_USER"),
		utils.MustGetEnv("STAKE_PASSWORD"),
		utils.MustGetEnv("STAKE_HOST"),
		utils.MustGetEnv("STAKE_PORT"),
		utils.MustGetEnv(("STAKE_DB")),
	)

	db, err := sql.Open("mysql", stakeConnString)
	if err != nil {
		fmt.Printf("failed to open stake database: %v\n", err)
		return nil, err
	}

	return db, nil
}

func newApp() (*payapi.App, error) {
	app := &payapi.App{}

	db, err := postgres.NewDatabase(connectionString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "couldn't create new database connection: %v\n", err)
		os.Exit(1)
	}

	app.NotifyService = slack.NewNotifyService(os.Getenv("SLACK_WEBHOOK_URL"))

	indexerAddress := utils.MustGetEnv("INDEXER_ADDRESS")
	indexerToken := os.Getenv("INDEXER_TOKEN")

	indexerService, err := algo.NewIndexerService(indexerAddress, indexerToken)
	if err != nil {
		return nil, fmt.Errorf("NewIndexerService() failed with error: %v", err)
	}

	app.IndexerService = *indexerService

	algodAddress := utils.MustGetEnv("ALGOD_ADDRESS")
	algodToken := os.Getenv("ALGOD_TOKEN")

	nodeService, err := algo.NewNodeService(algodAddress, algodToken)
	if err != nil {
		return nil, fmt.Errorf("NewNodeService() failed with error: %v", err)
	}

	app.NodeService = *nodeService

	platformService := postgres.NewPlatformService(db.DB)
	app.PlatformService = platformService

	paymentService := postgres.NewPaymentService(db.DB)
	app.PaymentService = paymentService

	// setup dependencies for payment service
	paymentService.PlatformService = platformService
	paymentService.IndexerService = *indexerService

	// attach stake service
	// TODO: attach actual ssh tunnel stake db instance
	stakeDatabase, err := connectToStake()
	if err != nil {
		return nil, fmt.Errorf("connectToStake() failed with error: %v", err)
	}

	// attach stake service
	stakeService := stake.NewStakeService(stakeDatabase)
	app.StakeService = *stakeService

	// staking services
	stakingPeriodService := postgres.NewStakingPeriodService(db.DB)
	app.StakingPeriodService = stakingPeriodService

	stakingCommitmentService := postgres.NewStakingCommitmentService(db.DB)
	app.StakingCommitmentService = stakingCommitmentService

	faucetSnapshotService := postgres.NewFaucetSnapshotService(db.DB, faucetDenylist)
	faucetSnapshotService.IndexerService = *indexerService
	app.FaucetSnapshotService = faucetSnapshotService

	// init stake profit snapshot
	stakeProfitSnapshotService := postgres.NewStakeProfitSnapshotService(db.DB)
	stakeProfitSnapshotService.StakeService = *stakeService
	stakeProfitSnapshotService.StakingPeriodService = stakingPeriodService
	app.StakeProfitSnapshotService = stakeProfitSnapshotService

	return app, nil
}

func main() {
	app, err := newApp()
	if err != nil {
		fmt.Fprintf(os.Stderr, "newApp() failed err: %s\n", err)
		os.Exit(1)
	}

	scheduler := gocron.NewScheduler(time.UTC)

	scheduler.Every(2).Minutes().Do(func() {
		checkPendingDeposits(app)
	})

	ctx := context.Background()

	// every 6 hours do house staking check and check casino profit
	scheduler.Every(1).Day().At("01:45").At("05:45").At("09:45").At("13:45").At("17:45").At("21:45").Do(func() {
		currentTime := time.Now().UTC()

		sps, err := app.StakingPeriodService.FindStakingPeriods(ctx, payapi.StakingPeriodFilter{})
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to get staking periods! err: %v\n", err)
			return
		}

		for _, sp := range sps {
			if currentTime.Before(sp.CommitmentBegin.UTC()) {
				//fmt.Fprintf(os.Stdout, "Staking Period %d commitment has not yet begun!\n", sp.ID)
				continue
			} else if currentTime.After(sp.CommitmentEnd.UTC()) {
				//fmt.Fprintf(os.Stdout, "Staking Period %d commitment has already ended!\n", sp.ID)
				continue
			}

			// create snap of profit
			snap, err := app.StakeProfitSnapshotService.CreateStakeProfitSnapshot(ctx, sp)
			if err != nil {
				log.Printf("CreateStakeProfitSnapshot() stakingPeriod: %d failed err: %v\n", sp.ID, err)
			}

			fmt.Printf("StakeProfitSnapshot created: stakingPeriod: %d time: %v snap.Profit: %v\n", snap.StakingPeriodID, snap.CreatedAt, snap.Profit)

			//we're within the commitment period, check eligibility
			CheckCommitments(ctx, app, sp.ID)
		}
	})

	// faucet snaps
	scheduler.Every(1).Day().At("00:00").At("06:00").At("12:00").At("18:00").Do(func() {
		v1asaId := uint64(552665159)  // TinymanPool1.1 chip-ALGO
		v2asaId := uint64(1002609713) // TinymanPool2.0 chip-ALGO

		//minBal := uint64(1000000)     // more than 1.0
		minBal := uint64(999999) // so that 1.0 will be included

		// take snap for vm v1 asa id
		v1snap, err := app.FaucetSnapshotService.CreateSnapshot(ctx, uint64(v1asaId), uint64(minBal))
		if err != nil {
			log.Printf("CreateSnapshot() assetId: %d failed err: %v\n", v1asaId, err)
		}

		text := fmt.Sprintf("V1 snap Created! ID: %d. CreatedAt: %v assetId: %d total holders %d\n", v1snap.ID, v1snap.CreatedAt, v1snap.AssetID, len(v1snap.Accounts))
		fmt.Print(text)

		// take snap for vm v1 asa id
		v2snap, err := app.FaucetSnapshotService.CreateSnapshot(ctx, uint64(v2asaId), uint64(minBal))
		if err != nil {
			log.Printf("CreateSnapshot() assetId: %d failed err: %v\n", v2asaId, err)
			return
		}

		text = fmt.Sprintf("V2 snap Created! ID: %d. CreatedAt: %v assetId: %d total holders %d\n", v2snap.ID, v2snap.CreatedAt, v2snap.AssetID, len(v2snap.Accounts))
		fmt.Print(text)

		for _, v := range liquidTargets {
			snap, err := app.FaucetSnapshotService.CreateSnapshot(ctx, v.assetId, minBal)
			if err != nil {
				log.Printf("CreateSnapshot() name: %s assetId: %d failed err: %v\n", v.name, v.assetId, err)
				return
			}

			text = fmt.Sprintf("faucet snap Created! ID: %d. CreatedAt: %v assetId: %d total holders %d\n", snap.ID, snap.CreatedAt, snap.AssetID, len(snap.Accounts))
			fmt.Print(text)
		}
	})

	// start scheduler in background
	scheduler.StartAsync()

	// Setting up signal capturing
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	// Waiting for SIGINT (kill -2)
	<-stop

	scheduler.Stop()
}
