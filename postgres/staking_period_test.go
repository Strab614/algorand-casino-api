package postgres_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/postgres"
)

func createNewStakingPeriod(registrationStart time.Time) *payapi.StakingPeriod {
	s := &payapi.StakingPeriod{
		RegistrationBegin: registrationStart,
		RegistrationEnd:   registrationStart.Add(time.Hour * 24),
		CommitmentBegin:   registrationStart.Add(time.Hour * 24),
		CommitmentEnd:     registrationStart.Add(time.Hour * 168), // 7 days
		ChipRatio:         1337,
	}

	return s
}

func TestStakingPeriodService_CreateStakingPeriod(t *testing.T) {
	// ensure a platform can be created

	t.Run("OK", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		s := postgres.NewStakingPeriodService(db.DB)

		stakingPeriod := createNewStakingPeriod(time.Now().UTC())

		err := s.CreateStakingPeriod(ctx, stakingPeriod)
		fmt.Printf("stakingPeriod: %v\n", stakingPeriod)
		if err != nil {
			t.Fatal(err)
		} else if got, want := stakingPeriod.ID, 1; got != want {
			t.Fatalf("ID=%v, want %v", got, want)
		}

		// helper, reflect.DeepEqual cant compare time.Time objects
		compareStakingPeriods := func(p1, p2 *payapi.StakingPeriod) bool {
			if p1.ID != p2.ID {
				return false
			}

			if !p1.RegistrationBegin.Equal(p2.RegistrationBegin) {
				return false
			}

			if !p1.RegistrationEnd.Equal(p2.RegistrationEnd) {
				return false
			}

			if !p1.CommitmentBegin.Equal(p2.CommitmentBegin) {
				return false
			}

			if !p2.CommitmentEnd.Equal(p2.CommitmentEnd) {
				return false
			}

			if p1.ChipRatio != p2.ChipRatio {
				return false
			}

			return true
		}

		fetched, err := s.FindStakingPeriodByID(ctx, stakingPeriod.ID)
		if err != nil {
			t.Fatal(err)
		} else if !compareStakingPeriods(stakingPeriod, fetched) {
			t.Fatalf("mismatch: \n%#v\n != \n%#v", stakingPeriod, fetched)
		}
	})

	t.Run("ErrBadParameters", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		s := postgres.NewStakingPeriodService(db.DB)

		err := s.CreateStakingPeriod(ctx, &payapi.StakingPeriod{})
		if err == nil {
			t.Fatal("expected error")
		}
	})
}
