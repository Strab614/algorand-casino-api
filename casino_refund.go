package payapi

import (
	"context"
	"time"

	"github.com/algo-casino/payapi/stake"
)

const (
	OnePercentNft int = 0
	TenPercentNft int = 1
)

type CasinoRefund struct {
	ID            uint32            `json:"id"`
	Address       string            `json:"address"`
	RefundType    int               `json:"refundType"`
	RefundAmount  float32           `json:"refundAmount"`
	Status        uint              `json:"status"` // 0 = created, 1 = completed, 2 = cancelled
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     *time.Time        `json:"updated_at"`
	UserProfile   stake.UserProfile `json:"profile"`
	TransactionID *string           `json:"txid"`
}

type CasinoRefundService interface {
	// Same as create, but only does the check
	// returning nft type, stake userprofile
	CheckRefund(ctx context.Context, address string) (int, *stake.UserProfile, error)

	// Create payment
	// returns error on failure, payment parameter will be updated upon success
	CreateRefund(ctx context.Context, address string) (*CasinoRefund, error)
}
