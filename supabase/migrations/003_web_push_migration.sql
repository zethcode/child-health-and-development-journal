-- Migration: Convert push_subscriptions from FCM to Web Push API
-- This migration changes the push_subscriptions table to store Web Push subscription data
-- instead of Firebase Cloud Messaging tokens.

-- Step 1: Drop the old FCM-specific column and constraint
ALTER TABLE push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_fcm_token_key;
ALTER TABLE push_subscriptions DROP COLUMN IF EXISTS fcm_token;

-- Step 2: Add Web Push subscription columns
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS endpoint TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS p256dh TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS auth TEXT;

-- Step 3: Make new columns required (after adding, set NOT NULL)
-- Note: If there's existing data, it will be lost. Run this on a fresh DB or migrate data first.
ALTER TABLE push_subscriptions ALTER COLUMN endpoint SET NOT NULL;
ALTER TABLE push_subscriptions ALTER COLUMN p256dh SET NOT NULL;
ALTER TABLE push_subscriptions ALTER COLUMN auth SET NOT NULL;

-- Step 4: Add unique constraint on endpoint (each subscription URL is unique)
ALTER TABLE push_subscriptions ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);

-- Step 5: Create index for faster lookups by endpoint
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Step 6: Update RLS policies remain the same (user_id based), no changes needed
