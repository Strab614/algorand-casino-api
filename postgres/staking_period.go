package postgres

import (
	"context"
	"errors"

	"github.com/algo-casino/payapi"
	"github.com/jackc/pgx/v4/pgxpool"
)

var _ payapi.StakingPeriodService = (*StakingPeriodService)(nil)

type (
	StakingPeriodService struct {
		db *pgxpool.Pool
	}
)

func NewStakingPeriodService(db *pgxpool.Pool) *StakingPeriodService {
	return &StakingPeriodService{
		db: db,
	}
}

func (s *StakingPeriodService) FindStakingPeriods(ctx context.Context, filter payapi.StakingPeriodFilter) ([]*payapi.StakingPeriod, error) {
	sql := `
		SELECT id, registration_begin, registration_end, commitment_begin, commitment_end, chip_ratio
		FROM staking_periods
		ORDER BY id ASC 
	`

	rows, err := s.db.Query(ctx, sql)
	if err != nil {
		return nil, err
	}

	sps := make([]*payapi.StakingPeriod, 0)

	for rows.Next() {
		var sp payapi.StakingPeriod

		err := rows.Scan(&sp.ID, &sp.RegistrationBegin, &sp.RegistrationEnd, &sp.CommitmentBegin, &sp.CommitmentEnd, &sp.ChipRatio)
		if err != nil {
			return nil, err
		}

		sps = append(sps, &sp)
	}

	return sps, nil
}

func (s *StakingPeriodService) FindStakingPeriodByID(ctx context.Context, id int) (*payapi.StakingPeriod, error) {
	sp := &payapi.StakingPeriod{
		ID: id,
	}

	sql := `
		SELECT registration_begin, registration_end, commitment_begin, commitment_end, chip_ratio
		FROM staking_periods
		WHERE id = $1
	`

	err := s.db.QueryRow(context.Background(), sql, id).Scan(&sp.RegistrationBegin, &sp.RegistrationEnd, &sp.CommitmentBegin, &sp.CommitmentEnd, &sp.ChipRatio)
	if err != nil {
		return nil, err
	}

	return sp, nil
}

func (s *StakingPeriodService) CreateStakingPeriod(ctx context.Context, stakingPeriod *payapi.StakingPeriod) error {
	if stakingPeriod == nil ||
		stakingPeriod.RegistrationBegin.IsZero() ||
		stakingPeriod.RegistrationEnd.IsZero() ||
		stakingPeriod.CommitmentBegin.IsZero() ||
		stakingPeriod.CommitmentEnd.IsZero() ||
		stakingPeriod.ChipRatio <= 0 {
		return errors.New("invalid parameters")
	}

	sql := `
		INSERT INTO staking_periods (registration_begin, registration_end, commitment_begin, commitment_end, chip_ratio)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	err := s.db.QueryRow(ctx, sql, stakingPeriod.RegistrationBegin, stakingPeriod.RegistrationEnd, stakingPeriod.CommitmentBegin, stakingPeriod.CommitmentEnd, stakingPeriod.ChipRatio).Scan(&stakingPeriod.ID)
	if err != nil {
		return err
	}

	return nil
}
