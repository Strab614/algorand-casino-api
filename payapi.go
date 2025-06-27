package payapi

import (
	"github.com/algo-casino/payapi/algo"
	"github.com/algo-casino/payapi/stake"
)

// generic structure to hold together what' required to run/function
type App struct {
	// algo node
	NodeService    algo.NodeService
	IndexerService algo.IndexerService

	// notify webhooks
	NotifyService NotifyService

	PlatformService PlatformService
	PaymentService  PaymentService

	CasinoRefundService CasinoRefundService
	StakeService        stake.StakeService

	// House staking
	StakingPeriodService     StakingPeriodService
	StakingCommitmentService StakingCommitmentService
	StakingResultService     StakingResultService

	// Faucet
	FaucetSnapshotService FaucetSnapshotService

	// autostake nft
	StakingNftService StakingNftService

	// profit tracking
	StakeProfitSnapshotService StakeProfitSnapshotService
}
