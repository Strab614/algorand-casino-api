package postgres_test

import (
	"context"
	"reflect"
	"testing"

	"github.com/algo-casino/payapi"

	"github.com/algo-casino/payapi/postgres"
)

func TestPaymentService_CreatePayment(t *testing.T) {
	// ensure a platform can be created

	t.Run("OK", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		// this should be mocked? maybe
		platformService := postgres.NewPlatformService(db.DB)

		platform := &payapi.Platform{
			Name:       "Test Platform",
			Active:     false,
			Address:    "AAAA",
			WebhookUrl: "https://domain.to.nowhere/",
		}

		// create test platform for below test
		err := platformService.CreatePlatform(ctx, platform)
		if err != nil {
			t.Fatalf("failed to create test platform err: %v\n", err)
		}

		s := postgres.NewPaymentService(db.DB)

		payment := &payapi.Payment{
			PlatformId: platform.ID,
			Status:     payapi.StatusCreated,
			Sender:     "AAAA",
			AssetId:    1337,
			Amount:     69,
			ExternalId: 420,
		}

		err = s.CreatePayment(ctx, payment)
		if err != nil {
			t.Fatal(err)
		} else if got, want := payment.ID, 1; got != want {
			t.Fatalf("ID=%v, want %v", got, want)
		}

		fetched, err := s.FindPaymentByID(ctx, payment.ID)
		if err != nil {
			t.Fatal(err)
		} else if !reflect.DeepEqual(payment, fetched) {
			t.Fatalf("mismatch: %#v != %#v", payment, fetched)
		}
	})

	t.Run("ErrPaymentRequired", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		// this should be mocked? maybe
		platformService := postgres.NewPlatformService(db.DB)

		platform := &payapi.Platform{
			Name:       "Test Platform",
			Active:     false,
			Address:    "AAAA",
			WebhookUrl: "https://domain.to.nowhere/",
		}

		// create test platform for below test
		err := platformService.CreatePlatform(ctx, platform)
		if err != nil {
			t.Fatalf("failed to create test platform err: %v\n", err)
		}

		s := postgres.NewPaymentService(db.DB)

		err = s.CreatePayment(ctx, &payapi.Payment{})
		if err == nil {
			t.Fatal("expected error")
		}
	})
}
