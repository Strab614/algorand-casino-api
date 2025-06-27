package payapi

import (
	"context"
)

type ()

type StakingNftService interface {
	// Create, return nil on success
	CreateAutoStake(ctx context.Context, stakingPeriodId int) error
}
