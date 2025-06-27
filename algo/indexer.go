package algo

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/algorand/go-algorand-sdk/client/v2/common/models"
	"github.com/algorand/go-algorand-sdk/client/v2/indexer"
)

type (
	IndexerService struct {
		indexerClient *indexer.Client
	}
)

func NewIndexerService(address, token string) (*IndexerService, error) {
	indexerClient, err := indexer.MakeClient(address, token)
	if err != nil {
		fmt.Printf("failed to make common client: %s\n", err)
		return nil, err
	}

	return &IndexerService{
		indexerClient: indexerClient,
	}, nil
}

func (s *IndexerService) HasMinimumTransactions(ctx context.Context, address string, min uint64) (bool, error) {
	r, err := s.indexerClient.SearchForTransactions().Limit(min).AddressString(address).Do(ctx)
	if err != nil {
		return false, err
	}

	if uint64(len(r.Transactions)) < min {
		return false, errors.New("not enough transactions on account")
	}

	return true, nil
}

func (s *IndexerService) GetAccountsWithAsset(ctx context.Context, assetId uint64) ([]models.MiniAssetHolding, error) {
	nextToken := ""

	res, err := s.indexerClient.LookupAssetBalances(assetId).IncludeAll(false).NextToken(nextToken).Do(ctx)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		return nil, err
	}

	nextToken = res.NextToken

	for nextToken != "" {
		res2, err := s.indexerClient.LookupAssetBalances(assetId).IncludeAll(false).NextToken(nextToken).Do(ctx)
		if err != nil {
			fmt.Printf("err: %v\n", err)
			return nil, err
		}

		res.Balances = append(res.Balances, res2.Balances...)

		nextToken = res2.NextToken

		// 100ms sleep to avoid getting rate limited
		time.Sleep(100 * time.Millisecond)
	}

	return res.Balances, err
}

// raw get transactions
// must be sent to `receiver` address, match the assetId
func (s *IndexerService) GetAssetTransactionsForAddress(ctx context.Context, receiver string, assetId uint64, afterTime, beforeTime time.Time) ([]models.Transaction, error) {
	r, err := s.indexerClient.LookupAccountTransactions(receiver).
		AssetID(assetId).     // must be chips ASA
		TxType("axfer").      // only asset transfer tx
		AfterTime(afterTime). // must be after time deposit was created
		BeforeTime(beforeTime).
		Do(ctx)
	if err != nil {
		fmt.Printf("err: %v\n", err)
		return nil, err
	}

	nextToken := r.NextToken

	for nextToken != "" {
		// do another lookup, but this time provide the nextToken
		r2, err := s.indexerClient.LookupAccountTransactions(receiver).
			AssetID(assetId).     // must be chips ASA
			TxType("axfer").      // only asset transfer tx
			AfterTime(afterTime). // must be after time deposit was created
			BeforeTime(beforeTime).
			NextToken(nextToken).
			Do(ctx)
		if err != nil {
			fmt.Printf("err: %v\n", err)
			return nil, err
		}

		r.Transactions = append(r.Transactions, r2.Transactions...)

		nextToken = r2.NextToken
	}

	return r.Transactions, nil
}

// TODO: add ability to check for algo txn as well

// check transaction exists meeting following criteria:
// sender, receiver, txid, amount, time (must have took place after given time)
// returns true if deposit exists, false otherwise
// only ASA transfers support at this time
func (s *IndexerService) CheckTransaction(ctx context.Context, txid, sender, receiver string, assetId, amount uint64, afterTime, beforeTime time.Time, mustMatchNote string) (bool, error) {
	txn, err := s.indexerClient.LookupTransaction(txid).Do(ctx)
	if err != nil {
		// failed to lookup txn
		return false, err
	}

	blockTime := time.Unix(int64(txn.Transaction.RoundTime), 0).UTC()

	if txn.Transaction.Type != "axfer" ||
		txn.Transaction.AssetTransferTransaction.Amount != amount ||
		txn.Transaction.AssetTransferTransaction.AssetId != assetId ||
		txn.Transaction.Sender != sender ||
		txn.Transaction.AssetTransferTransaction.Receiver != receiver {
		// didn't match amount, assetId, sender or receiver
		return false, errors.New("transaction did not match payment")
	} else if !blockTime.Before(beforeTime) || !blockTime.After(afterTime) {
		// must be within given time range
		fmt.Printf("blockTime: %v\n", blockTime)
		fmt.Printf("afterTime: %v\n", afterTime)
		fmt.Printf("beforeTime: %v\n", beforeTime)
		return false, errors.New("transaction outside time range")
	}

	if mustMatchNote != "" {
		note := txn.Transaction.Note

		if !bytes.Equal(note, []byte(mustMatchNote)) {
			return false, errors.New("note didn't match external id")
		}
	}

	return true, nil
}

func (s *IndexerService) GetAccountsWithMinimumAssetBalance(ctx context.Context, assetId uint64, minimumBalance uint64) ([]models.MiniAssetHolding, error) {
	res, err := s.indexerClient.LookupAssetBalances(assetId).CurrencyGreaterThan(minimumBalance).Do(ctx)
	if err != nil {
		fmt.Printf("LookupAssetBalances() err: %v\n", err)
		return nil, err
	}

	nextToken := res.NextToken

	for nextToken != "" {
		// do another lookup, but this time provide the nextToken
		r2, err := s.indexerClient.LookupAssetBalances(assetId).CurrencyGreaterThan(minimumBalance).
			NextToken(nextToken).
			Do(ctx)
		if err != nil {
			fmt.Printf("LookupAssetBalances() err: %v\n", err)
			return nil, err
		}

		res.Balances = append(res.Balances, r2.Balances...)

		nextToken = r2.NextToken
	}

	return res.Balances, nil
}
