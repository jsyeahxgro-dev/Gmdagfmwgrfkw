# Database Backups

This folder contains backup scripts and backup files for the MCBE TIERS PostgreSQL database.

## Folder Structure

- `daily/` - Automatic daily database backups
- `weekly/` - Weekly database backups (retained longer)
- `monthly/` - Monthly database backups (retained longest)
- `manual/` - Manual backup files created on-demand
- `scripts/` - Backup and restore scripts

## Environment Variables

The backup scripts use these environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST` - Database host
- `PGPORT` - Database port
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

## Usage

### Manual Backup
```bash
npm run backup:create
```

### Restore from Backup
```bash
npm run backup:restore [backup-file]
```

## Backup Retention

- Daily backups: Keep for 7 days
- Weekly backups: Keep for 4 weeks  
- Monthly backups: Keep for 12 months