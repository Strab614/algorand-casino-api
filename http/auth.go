package http

import (
	"bytes"
	"crypto/ed25519"
	"encoding/base32"
	"encoding/base64"
	"errors"
	"fmt"

	"github.com/algorand/go-algorand-sdk/encoding/msgpack"
	"github.com/algorand/go-algorand-sdk/types"
)

type AuthRequest struct {
	Payload string `json:"transaction" binding:"required"`
	PubKey  string `json:"pubkey" binding:"required"`
}

func getPubKey(address string) (ed25519.PublicKey, error) {
	checksumLenBytes := 4
	decoded, err := base32.StdEncoding.WithPadding(base32.NoPadding).DecodeString(address)
	if err != nil {
		return nil, errors.New("could not decode algo address")
	}
	if len(decoded) != len(types.Address{})+checksumLenBytes {
		return nil, errors.New("decoded algo address wrong length")
	}
	addressBytes := decoded[:len(types.Address{})]
	return addressBytes, nil
}

func rawVerifyTransaction(pubkey ed25519.PublicKey, transaction types.Transaction, sig []byte) bool {
	note := transaction.Note

	if !bytes.Equal(note, []byte("https://labs.algo-casino.com")) { // implement your own note / nonce validation here
		fmt.Println("note does not equal what is expected")
		return false
	}
	domainSeparator := []byte("TX")
	encodedTxn := msgpack.Encode(transaction)
	msgParts := [][]byte{domainSeparator, encodedTxn}
	toVerify := bytes.Join(msgParts, nil)

	return ed25519.Verify(pubkey, toVerify, sig)
}

func decodeTransaction(auth AuthRequest) (*types.SignedTxn, error) {
	// decoded the transaction, as the payload comes base64 encoded from the Typescript client
	decodedTransaction, err := base64.StdEncoding.DecodeString(auth.Payload)
	if err != nil {
		return nil, errors.New("cannot decode txn string")
	}

	// decode the transaction with msgpack
	var signedTxn types.SignedTxn
	err = msgpack.Decode(decodedTransaction, &signedTxn)
	if err != nil {
		return nil, errors.New("cannot decode txn msgpack")
	}

	return &signedTxn, nil
}

func CheckAuth(authRequest *AuthRequest) (error, bool) {
	if authRequest == nil {
		return errors.New("empty auth request"), false
	}

	signedTxn, err := decodeTransaction(*authRequest)
	if err != nil {
		return errors.New("failed to decode txn"), false
	}

	fmt.Printf("signedTxn.AuthAddr: %v\n", signedTxn.AuthAddr)

	var addrToCompare ed25519.PublicKey

	// is the auth addr zeroaddress? eg not rekeyed account
	if signedTxn.AuthAddr == types.ZeroAddress {
		// parse the pubkey from the Algo address
		pubkey, err := getPubKey(authRequest.PubKey)
		if err != nil {
			return errors.New("failed to get pubkey"), false
		}

		addrToCompare = pubkey
	} else {
		// account has been rekeyed, should be signed by the wallet it's been rekeyed to
		addrToCompare = signedTxn.AuthAddr[:]
	}

	if !rawVerifyTransaction(addrToCompare, signedTxn.Txn, signedTxn.Sig[:]) {
		return errors.New("failed to verify transaction"), false
	}

	return nil, true
}
