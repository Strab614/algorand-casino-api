package postgres_test

import (
	"context"
	"reflect"
	"testing"

	"github.com/algo-casino/payapi"
	"github.com/algo-casino/payapi/postgres"
)

func TestPlatformService_CreatePlatform(t *testing.T) {
	// ensure a platform can be created

	t.Run("OK", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		s := postgres.NewPlatformService(db.DB)

		platform := &payapi.Platform{
			Name:       "Test Platform",
			Active:     false,
			Address:    "AAAA",
			WebhookUrl: "https://domain.to.nowhere/",
		}

		err := s.CreatePlatform(ctx, platform)
		if err != nil {
			t.Fatal(err)
		} else if got, want := platform.ID, 1; got != want {
			t.Fatalf("ID=%v, want %v", got, want)
		}

		fetched, err := s.FindPlatformByID(ctx, platform.ID)
		if err != nil {
			t.Fatal(err)
		} else if !reflect.DeepEqual(platform, fetched) {
			t.Fatalf("mismatch: %#v != %#v", platform, fetched)
		}
	})

	t.Run("ErrPlatformRequired", func(t *testing.T) {
		db := MustOpenDatabase(t)
		defer MustCloseDatabase(t, db)

		ctx := context.Background()

		s := postgres.NewPlatformService(db.DB)

		err := s.CreatePlatform(ctx, &payapi.Platform{})
		if err == nil {
			t.Fatal("expected error")
		}
	})
}
