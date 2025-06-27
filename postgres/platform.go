package postgres

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/algo-casino/payapi"
	"github.com/jackc/pgx/v4/pgxpool"
)

var _ payapi.PlatformService = (*PlatformService)(nil)

type PlatformService struct {
	db *pgxpool.Pool
}

func NewPlatformService(db *pgxpool.Pool) *PlatformService {
	return &PlatformService{
		db: db,
	}
}

// paymentId - the PayAPI ID (stored as `external_id` column on casino `deposits` table)
func callCompleteDeposit(webhookUrl string, paymentId int, transactionId string) bool {
	type completeDepositRequest struct {
		ExternalId    int    `json:"externalId"`    // PayAPI payment ID
		TransactionId string `json:"transactionId"` // algorand txid
	}

	cdr := &completeDepositRequest{
		ExternalId:    paymentId,
		TransactionId: transactionId,
	}

	buf, err := json.Marshal(cdr)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		return false
	}

	req, err := http.NewRequest("GET", webhookUrl, bytes.NewReader(buf))
	if err != nil {
		return false
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{
		Timeout: time.Second * 10,
	}

	res, err := client.Do(req)
	if err != nil {
		fmt.Fprintf(os.Stderr, "got error %s", err.Error())
		return false
	}
	defer res.Body.Close()

	return res.StatusCode == http.StatusOK
}

func (s *PlatformService) FindPlatformByID(ctx context.Context, id int) (*payapi.Platform, error) {
	p := &payapi.Platform{
		ID: id,
	}

	sql := `
		SELECT name, active, address, webhook_url
		FROM platforms
		WHERE id = $1
		LIMIT 1
	`

	err := s.db.QueryRow(ctx, sql, id).Scan(
		&p.Name,
		&p.Active,
		&p.Address,
		&p.WebhookUrl,
	)

	if err != nil {
		fmt.Printf("err: %v\n", err)
		return nil, err
	}

	return p, nil
}

func (s *PlatformService) CreatePlatform(ctx context.Context, platform *payapi.Platform) error {
	// must have required fields
	if platform == nil || platform.Address == "" || platform.Name == "" || platform.WebhookUrl == "" {
		return errors.New("invalid parameters")
	}

	sql := `
		INSERT INTO platforms (name, address, active, webhook_url)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err := s.db.QueryRow(
		ctx,
		sql,
		platform.Name,
		platform.Address,
		platform.Active,
		platform.WebhookUrl,
	).Scan(
		&platform.ID,
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *PlatformService) NotifyDeposit(ctx context.Context, status int, payment payapi.Payment) error {
	platform, err := s.FindPlatformByID(ctx, payment.PlatformId)
	if err != nil {
		return err
	}

	switch status {
	case payapi.StatusCancelled:
		fmt.Println("not yet implemented for cancelled event")
	case payapi.StatusCompleted:
		// call webhook url with payment id
		callCompleteDeposit(platform.WebhookUrl, payment.ID, *payment.TransactionID)
	}

	return nil
}
