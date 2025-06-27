package payapi

import (
	"context"
	"time"
)

type (
	SnapshotAccount struct {
		// Algorand Address
		Address string `json:"address"`
		// Balance represented in unsigned 64 bit integer (may require conversion)
		Balance uint64 `json:"balance"`
	}

	Snapshot struct {
		ID int `json:"id"`
		// when was the snapshot created
		CreatedAt time.Time `json:"createdAt"`
		// which asset did we query?
		AssetID uint64 `json:"assetId"`
		// The individual accounts in the snapshot
		Accounts []*SnapshotAccount `json:"accounts"`
	}
)

type FaucetSnapshotService interface {
	// Same as create, but only does the check
	// returning nft type, stake userprofile
	CreateSnapshot(ctx context.Context, assetId, minimumBalance uint64) (*Snapshot, error)
}
