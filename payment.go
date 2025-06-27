package payapi

import (
	"context"
	"errors"
	"time"
)

const (
	StatusCreated   int = 0
	StatusCancelled int = 1
	StatusCompleted int = 2
)

type Payment struct {
	ID         int `json:"id"`
	PlatformId int `json:"platformId"`

	Status      int        `json:"status"`
	CreatedAt   time.Time  `json:"createdAt"`
	CancelledAt *time.Time `json:"cancelledAt"`
	CompletedAt *time.Time `json:"completedAt"`

	Sender  string `json:"sender"`  // algorand address of who's going to send the payment
	AssetId uint64 `json:"assetId"` // algorand asset id, or zero for network token
	Amount  uint64 `json:"amount"`  // amount in uint64

	TransactionID *string `json:"txid"` // algorand txid

	ExternalId int `json:"externalId"` // ID of payment on platforms internal storage (used for webhook notifications)
}

func (p *Payment) Validate() error {

	if p.PlatformId <= 0 {
		return errors.New("platformId cannot be <= 0")
	} else if p.Status < StatusCreated || p.Status > StatusCompleted {
		return errors.New("invalid status")
	} else if p.AssetId <= 0 || p.Amount <= 0 || p.Sender == "" {
		return errors.New("invalid transaction parameters")
	} else if p.ExternalId <= 0 {
		return errors.New("externalId cannot be <= 0")
	}

	return nil
}

type PaymentService interface {
	// group
	FindPayments(ctx context.Context, filter PaymentFilter) ([]*Payment, error)

	// Find a payment by ID, returns object
	FindPaymentByID(ctx context.Context, id int) (*Payment, error)

	// Create payment
	// returns error on failure, payment parameter will be updated upon success
	CreatePayment(ctx context.Context, payment *Payment) error

	// Complete payment
	// returns updated payment object upon success
	CompletePayment(ctx context.Context, id int, txid string) (*Payment, error)

	// Check and complete
	// only succeeds if given txid
	// external_id in note field must match Payment.ExternalId
	// must be `axfer`
	// amount, asset_id, sender, receiver (platform)
	// txn must be confirmed on network within 45 seconds of deposit creation
	CheckAndCompletePayment(ctx context.Context, id int, txid string, round *uint64) (*Payment, error)

	// Cancel payment (will notify platform via webhook call)
	// returns updated payment (with status Cancelled) object upon success
	CancelPayment(ctx context.Context, id int) (*Payment, error)
}

type PaymentFilter struct {
	PlatformId *int       `json:"platformId"`
	Status     *int       `json:"status"`
	BeforeTime *time.Time `json:"beforeTime"`
	AfterTime  *time.Time `json:"afterTime"`
}
