package postgres

import (
	"context"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/stake"
	"github.com/jackc/pgx/v4/pgxpool"
)

var _ payapi.StakeProfitSnapshotService = (*StakeProfitSnapshotService)(nil)

type (
	StakeProfitSnapshotService struct {
		db                   *pgxpool.Pool
		StakeService         stake.StakeService
		StakingPeriodService payapi.StakingPeriodService
	}
)

func NewStakeProfitSnapshotService(db *pgxpool.Pool) *StakeProfitSnapshotService {
	return &StakeProfitSnapshotService{
		db: db,
	}
}

func (s *StakeProfitSnapshotService) GetLastKnownProfitForPeriod(ctx context.Context, stakingPeriodId int) (*payapi.StakeProfitSnapshot, error) {
	sql := `
		SELECT id, created_at, profit
		FROM stake_profit_snapshots
		WHERE staking_period_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`

	snapshot := &payapi.StakeProfitSnapshot{
		StakingPeriodID: stakingPeriodId,
	}

	err := s.db.QueryRow(context.Background(), sql, stakingPeriodId).Scan(&snapshot.ID, &snapshot.CreatedAt, &snapshot.Profit)
	if err != nil {
		return nil, err
	}

	return snapshot, nil
}

func (s *StakeProfitSnapshotService) CreateStakeProfitSnapshot(ctx context.Context, sp *payapi.StakingPeriod) (*payapi.StakeProfitSnapshot, error) {
	profit, err := s.StakeService.GetGrossProfitForRange(ctx, sp.RegistrationBegin, sp.CommitmentEnd)
	if err != nil {
		return nil, err
	}

	sql := `
	INSERT INTO stake_profit_snapshots (created_at, staking_period_id, profit)
	VALUES (NOW(), $1, $2)
	RETURNING id, created_at
`

	snapshot := &payapi.StakeProfitSnapshot{
		StakingPeriodID: sp.ID,
		Profit:          profit,
	}

	err = s.db.QueryRow(ctx, sql, sp.ID, profit).Scan(&snapshot.ID, &snapshot.CreatedAt)
	if err != nil {
		return nil, err
	}

	return snapshot, nil
}
