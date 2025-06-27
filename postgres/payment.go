package postgres

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/algo"

	"github.com/jackc/pgx/v4/pgxpool"
)

var _ payapi.PaymentService = (*PaymentService)(nil)

type PaymentService struct {
	db              *pgxpool.Pool
	PlatformService payapi.PlatformService
	IndexerService  algo.IndexerService
	NodeService     algo.NodeService
}

func NewPaymentService(db *pgxpool.Pool) *PaymentService {
	return &PaymentService{
		db: db,
	}
}

func (s *PaymentService) FindPaymentByID(ctx context.Context, id int) (*payapi.Payment, error) {
	p := &payapi.Payment{
		ID: id,
	}

	sql := `
		SELECT platform_id, status, created_at, cancelled_at, completed_at, sender, asset_id, amount, transaction_id, external_id
		FROM payments
		WHERE id = $1
		LIMIT 1
	`

	err := s.db.QueryRow(ctx, sql, id).Scan(
		&p.PlatformId,
		&p.Status,
		&p.CreatedAt,
		&p.CancelledAt,
		&p.CompletedAt,
		&p.Sender,
		&p.AssetId,
		&p.Amount,
		&p.TransactionID,
		&p.ExternalId,
	)

	if err != nil {
		fmt.Printf("err: %v\n", err)
		return nil, err
	}

	return p, nil
}

func (s *PaymentService) FindPayments(ctx context.Context, filter payapi.PaymentFilter) ([]*payapi.Payment, error) {
	if filter.PlatformId == nil || filter.Status == nil || filter.AfterTime == nil || filter.BeforeTime == nil {
		return nil, errors.New("invalid parameters")
	}

	sql := `
			SELECT id, transaction_id, created_at, completed_at, cancelled_at, sender, asset_id, amount, external_id
			FROM payments
			WHERE platform_id = $1 AND status = $2 AND external_id IS NOT NULL AND created_at >= $3 AND created_at <= $4
			ORDER BY created_at DESC
		`

	rows, err := s.db.Query(context.TODO(), sql, *filter.PlatformId, *filter.Status, *filter.AfterTime, *filter.BeforeTime)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	payments := make([]*payapi.Payment, 0)

	for rows.Next() {
		var p payapi.Payment

		err := rows.Scan(&p.ID, &p.TransactionID, &p.CreatedAt, &p.CompletedAt, &p.CancelledAt, &p.Sender, &p.AssetId, &p.Amount, &p.ExternalId)
		if err != nil {
			panic(err)
		}

		p.PlatformId = *filter.PlatformId
		p.Status = *filter.Status

		payments = append(payments, &p)
	}

	return payments, nil
}

func (s *PaymentService) CreatePayment(ctx context.Context, payment *payapi.Payment) error {
	// ensure payment is valid
	err := payment.Validate()
	if err != nil {
		return err
	}

	sql := `
		INSERT INTO payments (platform_id, status, created_at, sender, asset_id, amount, external_id)
		VALUES ($1, $2, NOW(), $3, $4, $5, $6)
		RETURNING id, created_at
	`

	err = s.db.QueryRow(
		ctx,
		sql,
		payment.PlatformId,
		payapi.StatusCreated,
		payment.Sender,
		payment.AssetId,
		payment.Amount,
		payment.ExternalId,
	).Scan(
		&payment.ID,
		&payment.CreatedAt,
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *PaymentService) CancelPayment(ctx context.Context, id int) (*payapi.Payment, error) {
	payment, err := s.FindPaymentByID(ctx, int(id))
	if err != nil {
		return nil, errors.New("payment not found")
	}

	if payment.TransactionID != nil || payment.CompletedAt != nil {
		return nil, errors.New("payment already completed")
	}

	platform, err := s.PlatformService.FindPlatformByID(ctx, payment.PlatformId)
	if err != nil {
		return nil, errors.New("failed to find platform")
	}

	if !platform.Active {
		// platform is not currently accepting payments
		return nil, errors.New("platform is not currently active")
	}

	sql := `
		UPDATE payments
		SET status = $1, cancelled_at = NOW()
		WHERE id = $2
		RETURNING cancelled_at
	`

	err = s.db.QueryRow(ctx, sql, payapi.StatusCancelled, payment.ID).Scan(&payment.CancelledAt)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		return nil, errors.New("failed to update")
	}

	payment.Status = payapi.StatusCancelled

	// call hook endpoint, if any
	s.PlatformService.NotifyDeposit(ctx, payapi.StatusCancelled, *payment)

	return payment, nil
}

func (s *PaymentService) completePayment(ctx context.Context, payment *payapi.Payment, txid string) error {
	sql := `
		UPDATE payments
		SET status = $1, transaction_id = $2, completed_at = NOW()
		WHERE id = $3 AND status = 0
		RETURNING completed_at
	`

	err := s.db.QueryRow(ctx, sql, payapi.StatusCompleted, txid, payment.ID).Scan(&payment.CompletedAt)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		return errors.New("failed to update")
	}

	// update payment field with txid and status, already known as above succeeded
	payment.TransactionID = &txid
	payment.Status = payapi.StatusCompleted

	// call hook endpoint, if any
	s.PlatformService.NotifyDeposit(ctx, payapi.StatusCompleted, *payment)

	return nil
}

func (s *PaymentService) CheckAndCompletePayment(ctx context.Context, id int, txid string, round *uint64) (*payapi.Payment, error) {
	payment, err := s.FindPaymentByID(ctx, int(id))
	if err != nil {
		return nil, errors.New("payment not found")
	}

	if payment.TransactionID != nil || payment.CompletedAt != nil {
		return nil, errors.New("payment already completed")
	}

	platform, err := s.PlatformService.FindPlatformByID(ctx, payment.PlatformId)
	if err != nil {
		return nil, errors.New("failed to find platform")
	}

	if !platform.Active {
		// platform is not currently accepting payments
		return nil, errors.New("platform is not currently active")
	}

	// if round param, make sure its available first
	if round != nil {
		fmt.Printf("CheckAndCompletePayment() received param round = %d\n", *round)
		ok := s.NodeService.StatusAfterRound(ctx, *round)
		if ok != nil {
			return nil, errors.New("round is not yet available on algod node")
		}
	}

	// check deposit and verify
	ok, err := s.IndexerService.CheckTransaction(
		ctx,
		txid,
		payment.Sender,
		platform.Address,
		payment.AssetId,
		payment.Amount,
		payment.CreatedAt,
		payment.CreatedAt.Add(60*time.Second), // previously 30 second range, leading to few outside this range
		strconv.FormatInt(int64(payment.ExternalId), 10),
	)
	if err != nil || !ok {
		fmt.Printf("err: %v\n", err)
		// TODO: provide distinct errors
		return nil, errors.New("failed to check for deposit")
	}

	err = s.completePayment(ctx, payment, txid)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		return nil, errors.New("failed to complete payment")
	}

	return payment, nil
}

func (s *PaymentService) CompletePayment(ctx context.Context, id int, txid string) (*payapi.Payment, error) {
	payment, err := s.FindPaymentByID(ctx, int(id))
	if err != nil {
		return nil, errors.New("payment not found")
	}

	if payment.TransactionID != nil || payment.CompletedAt != nil {
		return nil, errors.New("payment already completed")
	}

	platform, err := s.PlatformService.FindPlatformByID(ctx, payment.PlatformId)
	if err != nil {
		return nil, errors.New("failed to find platform")
	}

	if !platform.Active {
		// platform is not currently accepting payments
		return nil, errors.New("platform is not currently active")
	}

	err = s.completePayment(ctx, payment, txid)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		return nil, errors.New("failed to complete payment")
	}

	return payment, nil
}
