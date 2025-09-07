#!/bin/bash

# Database restore script for MCBE TIERS
# This script restores a PostgreSQL database from a backup file

set -e

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file>"
    echo "Example: $0 ../manual/mcbe_tiers_backup_20231201_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file does not exist: $BACKUP_FILE"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ] && [ -z "$PGDATABASE" ]; then
    echo "Error: DATABASE_URL or PGDATABASE environment variable must be set"
    exit 1
fi

# Set default values from environment variables
DB_HOST=${PGHOST:-"localhost"}
DB_PORT=${PGPORT:-5432}
DB_USER=${PGUSER:-"postgres"}
DB_NAME=${PGDATABASE:-"mcbe_tiers"}

echo "Restoring database: $DB_NAME"
echo "From backup file: $BACKUP_FILE"

# Warning message
echo ""
echo "WARNING: This will replace all existing data in the database!"
echo "Database: $DB_NAME"
echo ""
read -p "Are you sure you want to continue? (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Determine if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Detected compressed backup file..."
    if [ ! -z "$DATABASE_URL" ]; then
        # Use DATABASE_URL if available (for Neon/cloud databases)
        gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
    else
        # Use individual connection parameters
        PGPASSWORD="$PGPASSWORD" gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
    fi
else
    echo "Detected uncompressed backup file..."
    if [ ! -z "$DATABASE_URL" ]; then
        # Use DATABASE_URL if available (for Neon/cloud databases)
        psql "$DATABASE_URL" < "$BACKUP_FILE"
    else
        # Use individual connection parameters
        PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"
    fi
fi

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo "Database restored successfully from: $BACKUP_FILE"
else
    echo "Error: Database restore failed"
    exit 1
fi

echo "Restore process completed successfully!"