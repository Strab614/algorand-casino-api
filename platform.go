package payapi

import "context"

type Platform struct {
	ID   int    `json:"id"`
	Name string `json:"name"` // name of the platform

	Active bool `json:"active"` // actively accepting payments?

	Address    string `json:"address"`    // where users will send funds to (algo address)
	WebhookUrl string `json:"webhookUrl"` // where we will call to notify upon payment success
}

type PlatformService interface {
	// Find a payment by ID, returns object
	FindPlatformByID(ctx context.Context, id int) (*Platform, error)

	// Create platform
	// returns error on failure, platform parameter will be updated upon success
	CreatePlatform(ctx context.Context, platform *Platform) error

	// Notify platform via webhook url of deposit status
	NotifyDeposit(ctx context.Context, status int, payment Payment) error
}
