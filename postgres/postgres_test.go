package postgres_test

import (
	"context"
	"fmt"
	"log"
	"testing"
	"time"

	"github.com/algo-casino/payapi/postgres"
	"github.com/ory/dockertest/v3"
)

var (
	dockerPool     *dockertest.Pool
	dockerResource *dockertest.Resource
)

func initDB() *postgres.Database {
	pool, err := dockertest.NewPool("")
	if err != nil {
		log.Fatalf("Could not construct pool: %s", err)
		return nil
	}

	// set global
	dockerPool = pool

	// uses pool to try to connect to Docker
	err = dockerPool.Client.Ping()
	if err != nil {
		log.Fatalf("Could not connect to Docker: %s", err)
		return nil
	}

	// pulls an image, creates a container based on it and runs it
	resource, err := dockerPool.Run(
		"postgres",
		"15",
		[]string{
			"POSTGRES_DB=payapi_test",
			"POSTGRES_USER=docker",
			"POSTGRES_PASSWORD=docker",
		})
	if err != nil {
		log.Fatalf("Could not start resource: %s", err)
		return nil
	}

	// set global
	dockerResource = resource

	rdb := &postgres.Database{}

	// exponential backoff-retry, because the application in the container might not be ready to accept connections yet
	if err := pool.Retry(func() error {
		var err error

		dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s", "docker", "docker", "localhost", dockerResource.GetPort("5432/tcp"), "payapi_test")

		db, err := postgres.NewDatabase(dsn)
		if err != nil {
			return err
		}

		rdb = db

		return db.DB.Ping(context.TODO())
	}); err != nil {
		log.Fatalf("Could not connect to database: %s", err)
	}

	return rdb
}

func TestDatabase(t *testing.T) {
	db := initDB()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err := db.DB.Ping(ctx)
	if err != nil {
		t.Fatalf("Could not ping DB within 10 seconds err: %v", err)
	}

	MustCloseDatabase(t, db)
}

func MustOpenDatabase(tb testing.TB) *postgres.Database {
	tb.Helper()

	return initDB()
}

func MustCloseDatabase(tb testing.TB, db *postgres.Database) {
	tb.Helper()

	err := db.Close()
	if err != nil {
		tb.Fatal(err)
	}

	// kill docker
	// You can't defer this because os.Exit doesn't care for defer
	if err := dockerPool.Purge(dockerResource); err != nil {
		log.Fatalf("Could not purge resource: %s", err)
	}
}
