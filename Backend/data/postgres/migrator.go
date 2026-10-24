package postgres

import (
	"context"
	_ "embed"
	"fmt"
	"log/slog"

	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed schema.sql
var schemaSQL string

// AutoMigrate applies the database schema if tables do not exist.
func AutoMigrate(ctx context.Context, pool *pgxpool.Pool) error {
	slog.Info("Running PostgreSQL schema auto-migration...")
	if _, err := pool.Exec(ctx, schemaSQL); err != nil {
		return fmt.Errorf("auto-migration failed: %w", err)
	}
	slog.Info("PostgreSQL schema auto-migration completed successfully")
	return nil
}
