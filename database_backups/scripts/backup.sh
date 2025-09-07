#!/bin/bash

# Database backup script for MCBE TIERS
# This script creates a PostgreSQL dump of the database

set -e

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

# Create timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_TYPE=${1:-"manual"}
BACKUP_DIR="../${BACKUP_TYPE}"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Create backup filename
BACKUP_FILE="${BACKUP_DIR}/mcbe_tiers_backup_${TIMESTAMP}.sql"

echo "Creating backup of database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Create the backup using pg_dump
if [ ! -z "$DATABASE_URL" ]; then
    # Use DATABASE_URL if available (for Neon/cloud databases)
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
else
    # Use individual connection parameters
    PGPASSWORD="$PGPASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
fi

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup created successfully: $BACKUP_FILE"
    echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "Error: Backup failed"
    exit 1
fi

# Compress the backup file
gzip "$BACKUP_FILE"
echo "Backup compressed: ${BACKUP_FILE}.gz"

# Clean up old backups based on retention policy
case $BACKUP_TYPE in
    "daily")
        echo "Cleaning up daily backups older than 7 days..."
        find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
        ;;
    "weekly")
        echo "Cleaning up weekly backups older than 28 days..."
        find "$BACKUP_DIR" -name "*.sql.gz" -mtime +28 -delete
        ;;
    "monthly")
        echo "Cleaning up monthly backups older than 365 days..."
        find "$BACKUP_DIR" -name "*.sql.gz" -mtime +365 -delete
        ;;
esac

echo "Backup process completed successfully!"