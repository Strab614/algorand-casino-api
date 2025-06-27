package postgres

import (
	"context"
	"log"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/algo"
	"github.com/jackc/pgx/v4/pgxpool"
)

var _ payapi.FaucetSnapshotService = (*FaucetSnapshotService)(nil)

type (
	FaucetSnapshotService struct {
		db              *pgxpool.Pool
		IndexerService  algo.IndexerService
		addressDenylist []string
	}
)

func NewFaucetSnapshotService(db *pgxpool.Pool, addressDenylist []string) *FaucetSnapshotService {
	return &FaucetSnapshotService{
		db:              db,
		addressDenylist: addressDenylist,
	}
}

// checks if an address is contained in the snapshot blacklist
// if yes, we should ignore it
func (s *FaucetSnapshotService) isAddressBlacklisted(address string) bool {
	for _, v := range s.addressDenylist {
		if v == address {
			return true
		}
	}

	return false
}

// internal functio that actually saves the snapshot in the database
func (s *FaucetSnapshotService) saveSnapshot(ctx context.Context, assetID uint64, accounts []*payapi.SnapshotAccount) (*payapi.Snapshot, error) {
	sql := `
		INSERT INTO faucet_snapshots (created_at, asset_id, accounts)
		VALUES (NOW(), $1, $2)
		RETURNING id, created_at
	`

	snapshot := &payapi.Snapshot{
		AssetID:  assetID,
		Accounts: accounts,
	}

	err := s.db.QueryRow(ctx, sql, assetID, accounts).Scan(&snapshot.ID, &snapshot.CreatedAt)
	if err != nil {
		return nil, err
	}

	return snapshot, nil
}

func (s *FaucetSnapshotService) CreateSnapshot(ctx context.Context, assetId, minimumBalance uint64) (*payapi.Snapshot, error) {
	snaps, err := s.IndexerService.GetAccountsWithMinimumAssetBalance(ctx, assetId, minimumBalance)
	if err != nil {
		log.Printf("GetAccountsWithMinimumAssetBalance() err: %v\n", err)
		return nil, err
	}

	snapshotAccounts := make([]*payapi.SnapshotAccount, 0)

	for _, v := range snaps {
		if s.isAddressBlacklisted(v.Address) {
			continue
		}

		snapshotAccounts = append(snapshotAccounts, &payapi.SnapshotAccount{Address: v.Address, Balance: v.Amount})
	}

	snapshot, err := s.saveSnapshot(ctx, assetId, snapshotAccounts)
	if err != nil {
		return nil, err
	}

	return snapshot, nil
}
