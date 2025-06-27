package postgres

import (
	"context"
	"errors"
	"fmt"
	"math"

	"github.com/algo-casino/payapi"
	"github.com/jackc/pgx/v4/pgxpool"
)

var _ payapi.StakingResultService = (*StakingResultService)(nil)

type (
	StakingResultService struct {
		db                       *pgxpool.Pool
		StakingPeriodService     payapi.StakingPeriodService
		StakingCommitmentService payapi.StakingCommitmentService
	}
)

func NewStakingResultService(db *pgxpool.Pool) *StakingResultService {
	return &StakingResultService{
		db: db,
	}
}

func (s *StakingResultService) CreateStakingResult(ctx context.Context, stakingPeriodId int, totalProfit uint64) (*payapi.StakingResult, error) {
	sp, err := s.StakingPeriodService.FindStakingPeriodByID(ctx, stakingPeriodId)
	if err != nil {
		return nil, err
	}

	stakingCommitments, err := s.StakingCommitmentService.FindStakingCommitments(context.Background(), payapi.StakingCommitmentFilter{StakingPeriodId: &stakingPeriodId})
	if err != nil {
		fmt.Printf("failed to get staking commitments. err: %v\n", err)
		return nil, err
	}

	fmt.Printf("len(stakingCommitments): %v\n", len(stakingCommitments))

	//initialize map
	resultsMap := make(map[string]float64)
	totalEquivalent := float64(0)

	for _, sc := range stakingCommitments {
		if sc.Eligible {
			address := sc.AlgorandAddress
			chipAmount := sc.ChipCommitment

			var lpAmount float64

			if sc.LiquidityCommitment > 0 || sc.LiquidityCommitmentV2 > 0 {
				lpAmount = (float64(sc.LiquidityCommitment+sc.LiquidityCommitmentV2) * sp.ChipRatio) / 1000000
			}

			var liquidAmount float64

			if sc.CAlgoCommitment > 0 || sc.TAlgoCommitment > 0 || sc.MAlgoCommitment > 0 || sc.XAlgoCommitment > 0 {
				liquidAmount = (float64(sc.CAlgoCommitment+sc.TAlgoCommitment+sc.MAlgoCommitment+sc.XAlgoCommitment) * sp.ChipRatio) / 1000000
			}

			equivAmt := lpAmount + liquidAmount + float64(chipAmount/10)
			resultsMap[address] = equivAmt

			totalEquivalent += equivAmt
			//fmt.Printf("%s,%d,%d,%.1f\n", address, chipAmount, sc.LiquidityCommitment, equivAmt)
		} else {

		}
	}

	items := make([]*payapi.StakingResultItem, 0)

	for k, sc := range resultsMap {
		percentHolding := (sc / totalEquivalent) * 100

		rewardAmt := math.Floor(float64(totalProfit) * percentHolding)

		item := &payapi.StakingResultItem{
			Address: k,
			Percent: percentHolding,
			Reward:  rewardAmt,
		}

		items = append(items, item)
	}

	sr := &payapi.StakingResult{
		StakingPeriodId: stakingPeriodId,
		Profit:          totalProfit,
		Results:         items,
	}
	sql := `
		INSERT INTO staking_results (staking_period_id, profit, results, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING id, created_at
	`

	err = s.db.QueryRow(ctx, sql, stakingPeriodId, totalProfit, items).Scan(&sr.ID, &sr.CreatedAt)
	if err != nil {
		return nil, err
	}

	return sr, nil
}

// // gets the result for the given staking period id, failing otherwise if not exists
func (s *StakingResultService) FindStakingResultByID(ctx context.Context, id int) (*payapi.StakingResult, error) {
	sr := &payapi.StakingResult{
		ID: id,
	}

	sql := `
		SELECT staking_period_id, profit, results, created_at
		FROM staking_results
		WHERE id = $1
	`

	err := s.db.QueryRow(context.Background(), sql, id).Scan(&sr.StakingPeriodId, &sr.Profit, &sr.Results, &sr.CreatedAt)
	if err != nil {
		return nil, err
	}

	return sr, nil
}

func (s *StakingResultService) FindStakingResults(ctx context.Context, filter payapi.StakingResultFilter) ([]*payapi.StakingResult, error) {
	if filter.StakingPeriodId == nil {
		return nil, errors.New("invalid parameters")
	}

	stakingPeriodId := *filter.StakingPeriodId

	sql := `
		SELECT id, profit, results, created_at
		FROM staking_results
		WHERE staking_period_id = $1
	`

	rows, err := s.db.Query(ctx, sql, stakingPeriodId)
	if err != nil {
		return nil, err
	}

	srs := make([]*payapi.StakingResult, 0)

	for rows.Next() {
		var sr payapi.StakingResult

		err := rows.Scan(&sr.ID, &sr.Profit, &sr.Results, &sr.CreatedAt)
		if err != nil {
			return nil, err
		}

		sr.StakingPeriodId = stakingPeriodId

		srs = append(srs, &sr)
	}

	return srs, nil

}
