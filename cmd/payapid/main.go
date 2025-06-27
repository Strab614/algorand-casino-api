package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"os/signal"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/algo"
	"github.com/algo-casino/payapi/chip"
	"github.com/algo-casino/payapi/http"
	"github.com/algo-casino/payapi/postgres"
	"github.com/algo-casino/payapi/slack"
	"github.com/algo-casino/payapi/stake"
	"github.com/algo-casino/payapi/utils"
	_ "github.com/go-sql-driver/mysql"
)

var (
	connectionString string
	serverPort       string
	// addresses to ignore for nft
	nftDenylist = []string{
		"KDPPCJTT32YU2KSY3DIRGY33WQSP7NW2TWCQTWEKYHNWBHEHGYK7THCD5Y", // sale smart contract
		"23BAMQDM73OE23MTLP4TFWLGQBQCKUYDIWDL2PDSFU2RRISXQUU772TFFU", // casino prize pool
	}
)

func init() {
	// Create postgres connection string from environment variables
	connectionString = fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s",
		utils.MustGetEnv("POSTGRES_USER"),
		utils.MustGetEnv("POSTGRES_PASS"),
		utils.MustGetEnv("POSTGRES_HOST"),
		utils.MustGetEnv("POSTGRES_PORT"),
		utils.MustGetEnv("POSTGRES_DB"),
	)

	serverPort = os.Getenv("PORT")
	if serverPort == "" {
		serverPort = "80"
	}
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
	paymentService.NodeService = *nodeService

	// attach stake service
	// TODO: attach actual ssh tunnel stake db instance
	stakeDatabase, err := connectToStake()
	if err != nil {
		return nil, fmt.Errorf("connectToStake() failed with error: %v", err)
	}

	// attach stake service
	stakeService := stake.NewStakeService(stakeDatabase)
	app.StakeService = *stakeService

	// setup refund service
	casinoRefundService := postgres.NewCasinoRefundService(db.DB)
	casinoRefundService.NodeService = *nodeService
	casinoRefundService.StakeService = *stakeService
	app.CasinoRefundService = casinoRefundService

	// staking services
	stakingPeriodService := postgres.NewStakingPeriodService(db.DB)
	app.StakingPeriodService = stakingPeriodService

	stakingCommitmentService := postgres.NewStakingCommitmentService(db.DB)
	stakingCommitmentService.StakingPeriodService = stakingPeriodService
	app.StakingCommitmentService = stakingCommitmentService

	stakingResultService := postgres.NewStakingResultService(db.DB)
	stakingResultService.StakingPeriodService = stakingPeriodService
	stakingResultService.StakingCommitmentService = stakingCommitmentService
	app.StakingResultService = stakingResultService

	stakingNftService := chip.NewStakingNftService(nftDenylist)
	stakingNftService.IndexerService = *indexerService
	stakingNftService.StakingCommitmentService = stakingCommitmentService
	app.StakingNftService = stakingNftService

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

	s := http.NewServer(app)

	// attach validator to http server
	s.Validator = *utils.NewValidator()

	s.Start(serverPort)

	log.Printf("PayAPI server listening on port %v\n", serverPort)

	// Setting up signal capturing
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	// Waiting for SIGINT (kill -2)
	<-stop

	// close server
	s.Close()
}
