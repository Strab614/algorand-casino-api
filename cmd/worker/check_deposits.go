package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/algo-casino/payapi"
	"github.com/algorand/go-algorand-sdk/client/v2/common/models"
)

func checkTxnMatchesPayment(payment *payapi.Payment, txn models.Transaction) bool {
	if txn.AssetTransferTransaction.Amount != payment.Amount {
		// amount didn't match what was expected
		return false
	} else if txn.Sender != payment.Sender {
		// sender wasn't who we expected
		return false
	}

	mustMatchNote := strconv.FormatInt(int64(payment.ExternalId), 10)

	// note field of txn must match external_id field of payment
	if !bytes.Equal(txn.Note, []byte(mustMatchNote)) {
		//log.Printf("payment %v note didn't match external id %s", payment.ExternalId, txn.Id)
		return false
	}

	blockTime := time.Unix(int64(txn.RoundTime), 0).UTC()

	// must be within given time range between payment being created and 60 seconds after
	if !blockTime.Before(payment.CreatedAt.Add(60*time.Second)) || !blockTime.After(payment.CreatedAt) {

		//fmt.Printf("blockTime: %v\n", blockTime)
		//fmt.Printf("afterTime: %v\n", afterTime)
		//fmt.Printf("beforeTime: %v\n", beforeTime)
		//log.Print("transaction outside time range")
		return false
	}

	return true
}

func checkPendingDeposits(app *payapi.App) {
	checkPendingDepositsForPlatform(app, 1) // casino
	checkPendingDepositsForPlatform(app, 2) // poker site
}

func checkPendingDepositsForPlatform(app *payapi.App, platformId int) {
	ctx := context.Background()

	platform, err := app.PlatformService.FindPlatformByID(ctx, platformId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to find platform 1. err: %v\n", err)
		return
	}

	status := payapi.StatusCreated // should be cancelled

	beforeTime := time.Now().Add(-2 * time.Minute) // must be at least 5 mins since created (suggesting user cannot call complete endpoint)
	afterTime := beforeTime.Add(-1 * time.Hour)    // just within the past hour, since we're polling every 5 mins should rarely be stragglers

	// get all payments for platform in the created state (waiting to be completed or cancelled)
	// returns newest first
	createdPayments, _ := app.PaymentService.FindPayments(context.TODO(), payapi.PaymentFilter{
		PlatformId: &platform.ID,
		Status:     &status,
		BeforeTime: &beforeTime,
		AfterTime:  &afterTime,
	})

	if len(createdPayments) <= 0 {
		log.Printf("FindPayments() for platformId: %d succeeded but no payments found\n", platform.ID)
		return
	}

	assetId := uint64(388592191)

	// get all txns between (NOW() - X hours) and NOW() ALL UTC
	txns, err := app.IndexerService.GetAssetTransactionsForAddress(ctx, platform.Address, assetId, afterTime, beforeTime)
	if err != nil {
		log.Printf("GetAssetTransactionsForAddress() for platformId: %d failed with err: %v\n", platform.ID, err)
		return
	}

	if len(txns) <= 0 {
		log.Printf("GetAssetTransactionsForAddress() for platformId: %d succeeded but no transactions found\n", platform.ID)
		return
	}

	for _, payment := range createdPayments {
		for _, txn := range txns {
			if checkTxnMatchesPayment(payment, txn) {

				// temporary, only 50,000 or less (or is poker platform)
				if payment.Amount > (50_000 * 10) {
					// too high for auto process atm
					msg := fmt.Sprintf("payment %d platform: %d cannot be auto processed amount: %d possible txn: %s (ensure checked)\n", payment.ID, platformId, payment.Amount, txn.Id)
					fmt.Print(msg)
					app.NotifyService.Notify(ctx, msg)
					continue
				}

				// mark as complete
				_, err := app.PaymentService.CompletePayment(ctx, payment.ID, txn.Id)
				if err != nil {
					// notify via slack as well, just easier to keep logs on this
					fmt.Printf("CompletePayment() err: %v\n", err)
				} else {
					msg := fmt.Sprintf("payment %d platformId: %d externalId: %d txid: %s\n", payment.ID, platformId, payment.ExternalId, txn.Id)
					fmt.Print(msg)
					app.NotifyService.Notify(ctx, msg)
				}
			} else {
				// txn didnt match payment
			}
		}
	}
}
