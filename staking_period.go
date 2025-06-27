package payapi

import (
	"context"
	"time"
)

type (
	StakingPeriod struct {
		ID int `json:"id"`

		// When can users register between?
		RegistrationBegin time.Time `json:"registrationBegin"`
		RegistrationEnd   time.Time `json:"registrationEnd"`

		// Actual commitment periods
		CommitmentBegin time.Time `json:"commitmentBegin"`
		CommitmentEnd   time.Time `json:"commitmentEnd"`

		// How many chips = 1 LP token at time of creation
		ChipRatio float64 `json:"chipRatio"`
	}

	StakingPeriodFilter struct {
	}
)

type StakingPeriodService interface {
	// find
	FindStakingPeriods(ctx context.Context, filter StakingPeriodFilter) ([]*StakingPeriod, error)

	// Find a payment by ID, returns object
	FindStakingPeriodByID(ctx context.Context, id int) (*StakingPeriod, error)

	// Create, return nil on success
	CreateStakingPeriod(ctx context.Context, stakingPeriod *StakingPeriod) error
}
