package algo

import (
	"context"
	"crypto/ed25519"
	"fmt"

	"github.com/algorand/go-algorand-sdk/crypto"
	"github.com/algorand/go-algorand-sdk/future"
	"github.com/algorand/go-algorand-sdk/mnemonic"
	"github.com/algorand/go-algorand-sdk/transaction"
)

type (
	AccountService struct {
		NodeService       *NodeService
		AccountAddress    string
		AccountPrivateKey ed25519.PrivateKey
	}
)

// Creates new account service instance
// Requires an account's private key
// Returns new instance on success, nil otherwise
func NewAccountService(accountMnemonic string) (*AccountService, error) {
	pk, err := mnemonic.ToPrivateKey(accountMnemonic)
	if err != nil {
		return nil, err
	}

	account, err := crypto.AccountFromPrivateKey(pk)
	if err != nil {
		return nil, err
	}

	return &AccountService{
		AccountAddress:    account.Address.String(),
		AccountPrivateKey: pk,
	}, nil
}

// Checks the algos balance of faucet account
// returns amount of microAlgos balance for account
func (s *AccountService) CheckAlgoBalance(ctx context.Context) (uint64, error) {
	return s.NodeService.CheckAssetBalance(ctx, s.AccountAddress, 0)
}

// Check the balance of the faucet by assetID
// returns amount if assetID is held by faucet account
func (s *AccountService) CheckAssetBalance(ctx context.Context, assetId uint64) (uint64, error) {
	return s.NodeService.CheckAssetBalance(ctx, s.AccountAddress, assetId)
}

// Creates, signs and send an asset from faucet account
// returns txid on success, may take a short period of time before is visible on the blockchain
func (s *AccountService) SendAsset(ctx context.Context, receiver string, assetID, amount uint64, note []byte) (string, error) {

	// Get network-related transaction parameters and assign
	txParams, err := s.NodeService.algodClient.SuggestedParams().Do(ctx)
	if err != nil {
		fmt.Printf("Error getting suggested tx params: %s\n", err)
		return "", err
	}

	// default fee 0.001 algos
	txParams.FlatFee = true
	txParams.Fee = 1000

	txn, err := future.MakeAssetTransferTxn(s.AccountAddress, receiver, amount, note, txParams, "", assetID)
	if err != nil {
		fmt.Printf("Failed to send transaction MakeAssetTransfer Txn: %s\n", err)
		return "", err
	}

	txid, stx, err := crypto.SignTransaction(s.AccountPrivateKey, txn)
	if err != nil {
		fmt.Printf("Failed to sign transaction: %s\n", err)
		return "", err
	}

	// Broadcast the transaction to the network
	_, err = s.NodeService.algodClient.SendRawTransaction(stx).Do(ctx)
	if err != nil {
		fmt.Printf("failed to send transaction: %s\n", err)
		return "", err
	}

	return txid, nil
}

// Sends algos from faucet account
// returns txid on success
func (s *AccountService) SendAlgo(ctx context.Context, toAddr string, amount uint64) (string, error) {
	// Construct the transaction
	txParams, err := s.NodeService.algodClient.SuggestedParams().Do(ctx)
	if err != nil {
		fmt.Printf("Error getting suggested tx params: %s\n", err)
		return "", err
	}

	minFee := uint64(1000)

	genID := txParams.GenesisID
	genHash := txParams.GenesisHash
	firstValidRound := uint64(txParams.FirstRoundValid)
	lastValidRound := uint64(txParams.LastRoundValid)

	txn, err := transaction.MakePaymentTxnWithFlatFee(s.AccountAddress, toAddr, minFee, amount, firstValidRound, lastValidRound, nil, "", genID, genHash)
	if err != nil {
		fmt.Printf("Error creating transaction: %s\n", err)
		return "", err
	}
	// Sign the transaction
	txID, signedTxn, err := crypto.SignTransaction(s.AccountPrivateKey, txn)
	if err != nil {
		fmt.Printf("Failed to sign transaction: %s\n", err)
		return "", err
	}

	// Submit the transaction
	_, err = s.NodeService.algodClient.SendRawTransaction(signedTxn).Do(ctx)
	if err != nil {
		fmt.Printf("failed to send transaction: %s\n", err)
		return "", err
	}

	return txID, nil
}
