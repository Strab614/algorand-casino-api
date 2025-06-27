package payapi

import "context"

type NotifyService interface {
	// returns error on failure, payment parameter will be updated upon success
	Notify(ctx context.Context, msg string) error
}
