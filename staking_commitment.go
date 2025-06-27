package payapi

import (
	"context"
	"time"
)

type (
	StakingCommitment struct {
		ID              int        `json:"id"`
		StakingPeriodID int        `json:"stakingPeriodId"`
		AlgorandAddress string     `json:"algorandAddress"`
		CreatedAt       time.Time  `json:"createdAt"`
		UpdatedAt       *time.Time `json:"updatedAt"`

		// how much are they going to commit?
		ChipCommitment        uint64 `json:"chipCommitment"`
		LiquidityCommitment   uint64 `json:"liquidityCommitment"`
		LiquidityCommitmentV2 uint64 `json:"liquidityCommitmentV2"` // TM v2 pool

		// new liquid concensus targets
		CAlgoCommitment uint64 `json:"cAlgoCommitment"`
		TAlgoCommitment uint64 `json:"tAlgoCommitment"`
		MAlgoCommitment uint64 `json:"mAlgoCommitment"`
		XAlgoCommitment uint64 `json:"xAlgoCommitment"`

		// Eligible for rewards?
		Eligible bool `json:"eligible"`
	}

	StakingCommitmentFilter struct {
		StakingPeriodId *int `json:"stakingPeriodId"`
	}
)

type StakingCommitmentService interface {

	// find
	FindStakingCommitments(ctx context.Context, filter StakingCommitmentFilter) ([]*StakingCommitment, error)

	// Find a payment by ID, returns object
	FindStakingCommitmentByID(ctx context.Context, id int) (*StakingCommitment, error)

	// Create, return nil on success
	CreateStakingCommitment(ctx context.Context, stakingCommitment *StakingCommitment) error

	// update, eg change commitment during reg period
	UpdateStakingCommitment(ctx context.Context, stakingCommitment *StakingCommitment) error

	// change eligibility
	UpdateEligibility(ctx context.Context, id int, eligible bool) (*StakingCommitment, error)
}
