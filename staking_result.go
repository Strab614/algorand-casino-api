package payapi

import (
	"context"
	"time"
)

type (
	StakingResultItem struct {
		Address string  `json:"address"`
		Percent float64 `json:"percent"`
		Reward  float64 `json:"reward"`
	}

	StakingResult struct {
		ID              int                  `json:"id"`
		StakingPeriodId int                  `json:"stakingPeriodId"`
		Profit          uint64               `json:"profit"`
		Results         []*StakingResultItem `json:"results"`
		CreatedAt       time.Time            `json:"created_at"`
	}

	StakingResultFilter struct {
		StakingPeriodId *int `json:"stakingPeriodId"`

		// more filter in future
	}
)

type StakingResultService interface {
	// find
	FindStakingResults(ctx context.Context, filter StakingResultFilter) ([]*StakingResult, error)

	// Find a payment by ID, returns object
	FindStakingResultByID(ctx context.Context, id int) (*StakingResult, error)

	// Create, return nil on success
	CreateStakingResult(ctx context.Context, stakingPeriodId int, totalProfit uint64) (*StakingResult, error)
}
