package payapi

import (
	"context"
	"time"
)

type (
	StakeProfitSnapshot struct {
		ID              int       `json:"id"`
		StakingPeriodID int       `json:"stakingPeriodId"`
		CreatedAt       time.Time `json:"createdAt"`

		Profit float64 `json:"profit"`
	}
)

type StakeProfitSnapshotService interface {
	// find last known profit for period
	GetLastKnownProfitForPeriod(ctx context.Context, stakingPeriodId int) (*StakeProfitSnapshot, error)

	// Create, return nil on success
	CreateStakeProfitSnapshot(ctx context.Context, stakingPeriod *StakingPeriod) (*StakeProfitSnapshot, error)
}
