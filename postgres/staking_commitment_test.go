package postgres_test

import (
	"context"
	"testing"
	"time"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/postgres"
)

func TestStakingCommitmentService_CreateStakingCommitment(t *testing.T) {
	// ensure a platform can be created

	t.Run("OK", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		// create dummy staking period service
		s := postgres.NewStakingPeriodService(db.DB)
		// create commitment service
		scs := postgres.NewStakingCommitmentService(db.DB)

		scs.StakingPeriodService = s

		// create dummy period for tests
		stakingPeriod := createNewStakingPeriod(time.Now().UTC())

		err := s.CreateStakingPeriod(ctx, stakingPeriod)

		if err != nil {
			t.Fatal(err)
		}

		sc := &payapi.StakingCommitment{
			StakingPeriodID:       stakingPeriod.ID,
			ChipCommitment:        10,
			LiquidityCommitment:   20,
			LiquidityCommitmentV2: 30,
			CAlgoCommitment:       40,
			TAlgoCommitment:       50,
			MAlgoCommitment:       60,
			XAlgoCommitment:       70,
		}

		err = scs.CreateStakingCommitment(ctx, sc)
		if err != nil {
			t.Fatal(err)
		}

		if sc.ChipCommitment != 10 {
			t.Fatalf("ChipCommitment=%v, want %v", sc.ChipCommitment, 10)
		} else if sc.LiquidityCommitment != 20 {
			t.Fatalf("LiquidityCommitment=%v, want %v", sc.LiquidityCommitment, 20)
		} else if sc.LiquidityCommitmentV2 != 30 {
			t.Fatalf("LiquidityCommitmentV2=%v, want %v", sc.LiquidityCommitmentV2, 30)
		} else if sc.CAlgoCommitment != 40 {
			t.Fatalf("CAlgoCommitment=%v, want %v", sc.CAlgoCommitment, 40)
		} else if sc.TAlgoCommitment != 50 {
			t.Fatalf("TAlgoCommitment=%v, want %v", sc.TAlgoCommitment, 50)
		} else if sc.MAlgoCommitment != 60 {
			t.Fatalf("MAlgoCommitment=%v, want %v", sc.MAlgoCommitment, 60)
		} else if sc.XAlgoCommitment != 70 {
			t.Fatalf("XAlgoCommitment=%v, want %v", sc.XAlgoCommitment, 70)
		}

	})

	t.Run("ErrBadParameters", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		// create dummy staking period service
		s := postgres.NewStakingPeriodService(db.DB)
		// create commitment service
		scs := postgres.NewStakingCommitmentService(db.DB)

		scs.StakingPeriodService = s

		// create dummy period for tests
		//stakingPeriod := createNewStakingPeriod(time.Now().UTC())

		err := scs.CreateStakingCommitment(ctx, &payapi.StakingCommitment{})
		if err == nil {
			t.Fatal("expected error")
		}
	})
}

func TestStakingCommitmentService_UpdateStakingCommitment(t *testing.T) {
	// ensure a platform can be created

	t.Run("OK", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		// create dummy staking period service
		s := postgres.NewStakingPeriodService(db.DB)
		// create commitment service
		scs := postgres.NewStakingCommitmentService(db.DB)

		scs.StakingPeriodService = s

		// create dummy period for tests
		stakingPeriod := createNewStakingPeriod(time.Now().UTC())

		err := s.CreateStakingPeriod(ctx, stakingPeriod)

		if err != nil {
			t.Fatal(err)
		}

		sc := &payapi.StakingCommitment{
			StakingPeriodID:       stakingPeriod.ID,
			ChipCommitment:        10,
			LiquidityCommitment:   20,
			LiquidityCommitmentV2: 30,
			CAlgoCommitment:       40,
			TAlgoCommitment:       50,
			MAlgoCommitment:       60,
			XAlgoCommitment:       70,
		}

		err = scs.CreateStakingCommitment(ctx, sc)
		if err != nil {
			t.Fatal(err)
		}

		sc.ChipCommitment = 11
		sc.LiquidityCommitment = 22
		sc.LiquidityCommitmentV2 = 33
		sc.CAlgoCommitment = 44
		sc.TAlgoCommitment = 55
		sc.MAlgoCommitment = 66
		sc.XAlgoCommitment = 77

		err = scs.UpdateStakingCommitment(ctx, sc)
		if err != nil {
			t.Fatal(err)
		}

		if sc.ChipCommitment != 11 {
			t.Fatalf("ChipCommitment=%v, want %v", sc.ChipCommitment, 11)
		} else if sc.LiquidityCommitment != 22 {
			t.Fatalf("LiquidityCommitment=%v, want %v", sc.LiquidityCommitment, 22)
		} else if sc.LiquidityCommitmentV2 != 33 {
			t.Fatalf("LiquidityCommitmentV2=%v, want %v", sc.LiquidityCommitmentV2, 33)
		} else if sc.CAlgoCommitment != 44 {
			t.Fatalf("CAlgoCommitment=%v, want %v", sc.CAlgoCommitment, 44)
		} else if sc.TAlgoCommitment != 55 {
			t.Fatalf("TAlgoCommitment=%v, want %v", sc.TAlgoCommitment, 55)
		} else if sc.MAlgoCommitment != 66 {
			t.Fatalf("MAlgoCommitment=%v, want %v", sc.MAlgoCommitment, 66)
		} else if sc.XAlgoCommitment != 77 {
			t.Fatalf("XAlgoCommitment=%v, want %v", sc.XAlgoCommitment, 77)
		}
	})

	t.Run("ErrBadParameters", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		// create dummy staking period service
		s := postgres.NewStakingPeriodService(db.DB)
		// create commitment service
		scs := postgres.NewStakingCommitmentService(db.DB)

		scs.StakingPeriodService = s

		// create dummy period for tests
		stakingPeriod := createNewStakingPeriod(time.Now().UTC())

		sc := &payapi.StakingCommitment{
			StakingPeriodID:       stakingPeriod.ID,
			ChipCommitment:        10,
			LiquidityCommitment:   20,
			LiquidityCommitmentV2: 30,
			CAlgoCommitment:       40,
			TAlgoCommitment:       50,
			MAlgoCommitment:       60,
			XAlgoCommitment:       70,
		}

		err := scs.CreateStakingCommitment(ctx, sc)
		if err == nil {
			t.Fatal("expected error")
		}

		err = scs.UpdateStakingCommitment(ctx, &payapi.StakingCommitment{})
		if err == nil {
			t.Fatal("update proceeded with null params")
		}
	})
}

func TestStakingCommitmentService_UpdateEligibility(t *testing.T) {
	// ensure a platform can be created

	t.Run("OK", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		// create dummy staking period service
		s := postgres.NewStakingPeriodService(db.DB)
		// create commitment service
		scs := postgres.NewStakingCommitmentService(db.DB)

		scs.StakingPeriodService = s

		// create dummy period for tests
		stakingPeriod := createNewStakingPeriod(time.Now().UTC())

		err := s.CreateStakingPeriod(ctx, stakingPeriod)

		if err != nil {
			t.Fatal(err)
		}

		sc := &payapi.StakingCommitment{
			StakingPeriodID:       stakingPeriod.ID,
			ChipCommitment:        10,
			LiquidityCommitment:   20,
			LiquidityCommitmentV2: 30,
			CAlgoCommitment:       40,
			TAlgoCommitment:       50,
			MAlgoCommitment:       60,
			XAlgoCommitment:       70,
		}

		err = scs.CreateStakingCommitment(ctx, sc)
		if err != nil {
			t.Fatal(err)
		}

		newSc, err := scs.UpdateEligibility(ctx, sc.ID, false)
		if err != nil {
			t.Fatal(err)
		}

		if newSc.ChipCommitment != 10 {
			t.Fatalf("ChipCommitment=%v, want %v", newSc.ChipCommitment, 10)
		} else if newSc.LiquidityCommitment != 20 {
			t.Fatalf("LiquidityCommitment=%v, want %v", newSc.LiquidityCommitment, 20)
		} else if newSc.LiquidityCommitmentV2 != 30 {
			t.Fatalf("LiquidityCommitmentV2=%v, want %v", newSc.LiquidityCommitmentV2, 30)
		} else if newSc.CAlgoCommitment != 40 {
			t.Fatalf("CAlgoCommitment=%v, want %v", newSc.CAlgoCommitment, 40)
		} else if newSc.TAlgoCommitment != 50 {
			t.Fatalf("TAlgoCommitment=%v, want %v", newSc.TAlgoCommitment, 50)
		} else if newSc.MAlgoCommitment != 60 {
			t.Fatalf("MAlgoCommitment=%v, want %v", newSc.MAlgoCommitment, 60)
		} else if newSc.XAlgoCommitment != 70 {
			t.Fatalf("XAlgoCommitment=%v, want %v", newSc.XAlgoCommitment, 70)
		}
	})
}
