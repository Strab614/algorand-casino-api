package postgres

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"sort"

	"github.com/jackc/pgx/v4/pgxpool"
)

//go:embed migration/*.sql
var migrationFS embed.FS

type Database struct {
	DB  *pgxpool.Pool
	DSN string
}

// creates a new database instance and runs any migrations (if needed)
func NewDatabase(connString string) (*Database, error) {
	pool, err := pgxpool.Connect(context.TODO(), connString)
	if err != nil {
		return nil, err
	}

	db := &Database{DB: pool, DSN: connString}

	err = db.migrate()
	if err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return db, nil
}

func (db *Database) migrate() error {
	// Ensure the 'migrations' table exists so we don't duplicate migrations.
	_, err := db.DB.Exec(context.TODO(), `CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY);`)
	if err != nil {
		return fmt.Errorf("cannot create migrations table: %w", err)
	}

	// Read migration files from our embedded file system.
	// This uses Go 1.16's 'embed' package.
	names, err := fs.Glob(migrationFS, "migration/*.sql")
	if err != nil {
		return err
	}
	sort.Strings(names)

	// Loop over all migration files and execute them in order.
	for _, name := range names {
		if err := db.migrateFile(name); err != nil {
			return fmt.Errorf("migration error: name=%q err=%w", name, err)
		}
	}
	return nil
}

// migrate runs a single migration file within a transaction. On success, the
// migration file name is saved to the "migrations" table to prevent re-running.
func (db *Database) migrateFile(name string) error {
	tx, err := db.DB.Begin(context.TODO())
	if err != nil {
		return err
	}
	defer tx.Rollback(context.TODO())

	// Ensure migration has not already been run.
	var n int
	if err := tx.QueryRow(context.TODO(), `SELECT COUNT(*) FROM migrations WHERE name = $1`, name).Scan(&n); err != nil {
		return err
	} else if n != 0 {
		return nil // already run migration, skip
	}

	// Read and execute migration file.
	if buf, err := fs.ReadFile(migrationFS, name); err != nil {
		return err
	} else if _, err := tx.Exec(context.TODO(), string(buf)); err != nil {
		return err
	}

	// Insert record into migrations to prevent re-running migration.
	if _, err := tx.Exec(context.TODO(), `INSERT INTO migrations (name) VALUES ($1)`, name); err != nil {
		return err
	}

	return tx.Commit(context.TODO())
}

func (db *Database) Close() error {
	// if there is context, cancel it
	// todo

	if db.DB != nil {
		db.DB.Close()
		return nil
	}

	return nil
}
