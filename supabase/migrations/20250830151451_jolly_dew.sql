/*
  # Update profiles table for usage tracking

  1. Changes
    - Add daily_usage column to track daily generation count
    - Add last_usage_reset column to track when usage was last reset
    - Set default values for existing users

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Add daily usage tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'daily_usage'
  ) THEN
    ALTER TABLE profiles ADD COLUMN daily_usage integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_usage_reset'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_usage_reset date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Update existing profiles to have default values
UPDATE profiles 
SET 
  daily_usage = 0,
  last_usage_reset = CURRENT_DATE
WHERE daily_usage IS NULL OR last_usage_reset IS NULL;