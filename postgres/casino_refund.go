package postgres

import (
	"context"
	"errors"
	"math"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/algo"
	"github.com/algo-casino/payapi/stake"
	"github.com/jackc/pgx/v4/pgxpool"
)

var _ payapi.CasinoRefundService = (*CasinoRefundService)(nil)

const (
	OnePercentASAID = 797090353 // 500 supply
	TenPercentASAID = 797095358 // 3 supply
)

type CasinoRefundService struct {
	db           *pgxpool.Pool
	NodeService  algo.NodeService
	StakeService stake.StakeService
}

func NewCasinoRefundService(db *pgxpool.Pool) *CasinoRefundService {
	return &CasinoRefundService{
		db: db,
	}
}

func (s *CasinoRefundService) checkRefundType(ctx context.Context, address string) (int, error) {
	// query that algorandAddress has the NFT in their wallet
	tenBalance, err := s.NodeService.CheckAssetBalance(ctx, address, TenPercentASAID)
	if err == nil {
		if tenBalance > 0 {
			return payapi.TenPercentNft, nil
		}
	}

	oneBalance, err := s.NodeService.CheckAssetBalance(ctx, address, OnePercentASAID)
	if err == nil {
		if oneBalance > 0 {
			return payapi.OnePercentNft, nil
		}
	}

	if err == nil {
		err = errors.New("something went wrong")
	}

	return -1, err
}

func (s *CasinoRefundService) CheckRefund(ctx context.Context, address string) (int, *stake.UserProfile, error) {
	t, err := s.checkRefundType(ctx, address)
	if err != nil {
		return -1, nil, err
	}

	p, err := s.StakeService.GetUserProfileByAddress(ctx, address)
	if err != nil {
		return -1, nil, err
	}

	// return type, profile (with all stats)
	return t, p, nil
}

func (s *CasinoRefundService) CreateRefund(ctx context.Context, address string) (*payapi.CasinoRefund, error) {
	sql := `
		INSERT INTO casino_refunds (address, refund_type, status, amount, created_at, user_profile)
		VALUES ($1, $2, $3, $4, NOW(), $5)
		RETURNING id, created_at
	`
	var scale int

	t, err := s.checkRefundType(ctx, address)
	if err != nil {
		return nil, err
	}

	if t == payapi.OnePercentNft {
		scale = 1
	} else if t == payapi.TenPercentNft {
		scale = 10
	} else {
		return nil, errors.New("invalid refundType parameter")
	}

	p, err := s.StakeService.GetUserProfileByAddress(ctx, address)
	if err != nil {
		return nil, err
	}

	amount := float32(math.Abs(float64(p.ProfitTotal)) * (float64(scale) / 100))

	nftClaim := &payapi.CasinoRefund{
		Address:      address,
		RefundType:   t,
		Status:       0,
		RefundAmount: amount,
		UserProfile:  *p,
		// txid and updated_at empty
	}

	err = s.db.QueryRow(ctx, sql, address, t, 0, amount, p).Scan(&nftClaim.ID, &nftClaim.CreatedAt)
	if err != nil {
		return nil, err
	}

	return nftClaim, nil
}
