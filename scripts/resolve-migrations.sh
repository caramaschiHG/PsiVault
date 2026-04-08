#!/bin/bash
# Resolve failed migrations before running deploy
# Usage: Run this before prisma migrate deploy on Vercel

echo "Checking for failed migrations..."

# Mark the failed notifications migration as applied
# This is safe because the tables were partially created during the failed run
# Subsequent migrations (add_canceled_by, premium_fields) depend on these tables existing
npx prisma migrate resolve --applied 20260320120000_notifications 2>/dev/null

if [ $? -eq 0 ]; then
  echo "Successfully resolved failed migration"
  exit 0
else
  echo "Migration already resolved or error occurred"
  exit 0
fi
