package slack

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/algo-casino/payapi"
)

var _ payapi.NotifyService = (*NotifyService)(nil)

type (
	NotifyService struct {
		payapi.NotifyService
		baseURL string
	}

	slackPayload struct {
		Text string `json:"text"`
	}
)

// baseURL = slack webhook url
func NewNotifyService(baseURL string) *NotifyService {
	return &NotifyService{
		baseURL: baseURL,
	}
}

func (s *NotifyService) Notify(ctx context.Context, msg string) error {
	js, err := json.Marshal(slackPayload{Text: msg})
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", s.baseURL, bytes.NewBuffer(js))
	if err != nil {
		return err
	}

	// add required headers
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	// close body on func return
	defer resp.Body.Close()

	buf, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if string(buf) != "ok" {
		return errors.New("wrong status message")
	}

	// we can only accept response code 200
	if resp.StatusCode != http.StatusOK {
		return errors.New("wrong status code")
	}

	return nil
}
