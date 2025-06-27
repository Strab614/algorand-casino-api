package algo

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/algorand/go-algorand-sdk/client/v2/algod"
)

type (
	NodeService struct {
		algodClient *algod.Client
	}
)

func NewNodeService(address, token string) (*NodeService, error) {
	client, err := algod.MakeClient(address, token)
	if err != nil {
		fmt.Printf("failed to make common client: %s\n", err)
		return nil, err
	}

	return &NodeService{
		algodClient: client,
	}, nil
}

// higher function, this should be moved to its own service layer eventually (or inherited)
func (s *NodeService) CheckAssetBalance(ctx context.Context, address string, assetId uint64) (uint64, error) {
	accountInfo, err := s.algodClient.AccountInformation(address).Do(ctx)
	if err != nil {
		return 0, err
	}

	// check algo balance
	if assetId == 0 {
		return accountInfo.Amount, nil
	}

	// find the asset they're requiring
	for _, asset := range accountInfo.Assets {
		if asset.AssetId == assetId {
			return asset.Amount, nil
		}
	}

	return 0, errors.New("no such asset found")
}

func (s *NodeService) StatusAfterRound(ctx context.Context, round uint64) error {
	fmt.Printf("starting at %v\n", time.Now().UTC())
	r, err := s.algodClient.StatusAfterBlock(round).Do(ctx)
	if err != nil {
		return errors.New(err.Error())
	}

	fmt.Printf("finished at %v\n", time.Now().UTC())
	if r.LastRound < round {
		return errors.New("last round before required round")
	}

	return nil
}
