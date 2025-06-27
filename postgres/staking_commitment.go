package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/algo-casino/payapi"
	"github.com/jackc/pgx/v4/pgxpool"
)

var _ payapi.StakingCommitmentService = (*StakingCommitmentService)(nil)

type (
	StakingCommitmentService struct {
		db                   *pgxpool.Pool
		StakingPeriodService payapi.StakingPeriodService
	}
)

func NewStakingCommitmentService(db *pgxpool.Pool) *StakingCommitmentService {
	return &StakingCommitmentService{
		db: db,
	}
}

func (s *StakingCommitmentService) FindStakingCommitments(ctx context.Context, filter payapi.StakingCommitmentFilter) ([]*payapi.StakingCommitment, error) {
	if filter.StakingPeriodId == nil {
		return nil, errors.New("invalid parameters")
	}

	stakingPeriodId := *filter.StakingPeriodId

	sql := `
		SELECT id, algorand_address, created_at, updated_at, chip_commitment, liquidity_commitment, liquidity_commitment_v2, c_algo_commitment, t_algo_commitment, m_algo_commitment, x_algo_commitment, eligible
		FROM staking_commitments
		WHERE staking_period_id = $1
	`

	rows, err := s.db.Query(ctx, sql, stakingPeriodId)
	if err != nil {
		return nil, err
	}

	scs := make([]*payapi.StakingCommitment, 0)

	for rows.Next() {
		var sc payapi.StakingCommitment

		err := rows.Scan(&sc.ID, &sc.AlgorandAddress, &sc.CreatedAt, &sc.UpdatedAt, &sc.ChipCommitment, &sc.LiquidityCommitment, &sc.LiquidityCommitmentV2, &sc.CAlgoCommitment, &sc.TAlgoCommitment, &sc.MAlgoCommitment, &sc.XAlgoCommitment, &sc.Eligible)
		if err != nil {
			return nil, err
		}

		sc.StakingPeriodID = stakingPeriodId

		scs = append(scs, &sc)
	}

	return scs, nil
}

func (s *StakingCommitmentService) FindStakingCommitmentByID(ctx context.Context, id int) (*payapi.StakingCommitment, error) {
	sql := `
		SELECT staking_period_id, algorand_address, created_at, updated_at, chip_commitment, liquidity_commitment, liquidity_commitment_v2, c_algo_commitment, t_algo_commitment, m_algo_commitment, x_algo_commitment, eligible
		FROM staking_commitments
		WHERE id = $1
	`
	sc := &payapi.StakingCommitment{
		ID: id,
	}

	err := s.db.QueryRow(context.Background(), sql, id).Scan(&sc.StakingPeriodID, &sc.AlgorandAddress, &sc.CreatedAt, &sc.UpdatedAt, &sc.ChipCommitment, &sc.LiquidityCommitment, &sc.LiquidityCommitmentV2, &sc.CAlgoCommitment, &sc.TAlgoCommitment, &sc.MAlgoCommitment, &sc.XAlgoCommitment, &sc.Eligible)
	if err != nil {
		return nil, err
	}

	return sc, nil
}

func (s *StakingCommitmentService) CreateStakingCommitment(ctx context.Context, stakingCommitment *payapi.StakingCommitment) error {
	stakingPeriod, err := s.StakingPeriodService.FindStakingPeriodByID(ctx, stakingCommitment.StakingPeriodID)
	if err != nil {
		return err
	}

	currentTime := time.Now().UTC()

	if currentTime.After(stakingPeriod.RegistrationEnd) {
		// registration has already ended
		return errors.New("registration period has ended")
	} else if currentTime.Before(stakingPeriod.RegistrationBegin) {
		// registration has not yet begun
		return errors.New("registration period has not begun")
	}

	// we are within the registration period
	sql := `
		INSERT INTO staking_commitments (staking_period_id, algorand_address, created_at, chip_commitment, liquidity_commitment, liquidity_commitment_v2, c_algo_commitment, t_algo_commitment, m_algo_commitment, x_algo_commitment, eligible)
		VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, TRUE)
		RETURNING id, created_at
	`

	err = s.db.QueryRow(ctx, sql, stakingCommitment.StakingPeriodID, stakingCommitment.AlgorandAddress, stakingCommitment.ChipCommitment, stakingCommitment.LiquidityCommitment, stakingCommitment.LiquidityCommitmentV2, stakingCommitment.CAlgoCommitment, stakingCommitment.TAlgoCommitment, stakingCommitment.MAlgoCommitment, stakingCommitment.XAlgoCommitment).Scan(&stakingCommitment.ID, &stakingCommitment.CreatedAt)
	if err != nil {
		return err
	}

	// always will be eligible on creation
	stakingCommitment.Eligible = true

	return nil
}

func (s *StakingCommitmentService) UpdateStakingCommitment(ctx context.Context, stakingCommitment *payapi.StakingCommitment) error {
	sql := `
		UPDATE staking_commitments
		SET chip_commitment = $1, liquidity_commitment = $2, liquidity_commitment_v2 = $3, c_algo_commitment = $4, t_algo_commitment = $5, m_algo_commitment = $6, x_algo_commitment = $7, created_at = NOW()
		WHERE id = $8
		RETURNING staking_period_id, algorand_address, created_at, eligible
	`

	stakingPeriod, err := s.StakingPeriodService.FindStakingPeriodByID(ctx, stakingCommitment.StakingPeriodID)
	if err != nil {
		return err
	}

	currentTime := time.Now().UTC()

	if currentTime.After(stakingPeriod.RegistrationEnd) {
		// registration has already ended
		return errors.New("registration period has ended")
	} else if currentTime.Before(stakingPeriod.RegistrationBegin) {
		// registration has not yet begun
		return errors.New("registration period has not begun")
	}

	err = s.db.QueryRow(ctx, sql, stakingCommitment.ChipCommitment, stakingCommitment.LiquidityCommitment, stakingCommitment.LiquidityCommitmentV2, stakingCommitment.CAlgoCommitment, stakingCommitment.TAlgoCommitment, stakingCommitment.MAlgoCommitment, stakingCommitment.XAlgoCommitment, stakingCommitment.ID).Scan(&stakingCommitment.StakingPeriodID, &stakingCommitment.AlgorandAddress, &stakingCommitment.CreatedAt, &stakingCommitment.Eligible)
	if err != nil {
		return err
	}

	return nil
}

func (s *StakingCommitmentService) UpdateEligibility(ctx context.Context, id int, eligible bool) (*payapi.StakingCommitment, error) {
	sql := `
		UPDATE staking_commitments
		SET eligible = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING staking_period_id, algorand_address, created_at, updated_at, chip_commitment, liquidity_commitment, liquidity_commitment_v2, c_algo_commitment, t_algo_commitment, m_algo_commitment, x_algo_commitment
	`

	sc := &payapi.StakingCommitment{
		ID:       id,
		Eligible: eligible,
	}

	err := s.db.QueryRow(ctx, sql, eligible, id).Scan(&sc.StakingPeriodID, &sc.AlgorandAddress, &sc.CreatedAt, &sc.UpdatedAt, &sc.ChipCommitment, &sc.LiquidityCommitment, &sc.LiquidityCommitmentV2, &sc.CAlgoCommitment, &sc.TAlgoCommitment, &sc.MAlgoCommitment, &sc.XAlgoCommitment)
	if err != nil {
		return nil, err
	}

	return sc, nil
}
