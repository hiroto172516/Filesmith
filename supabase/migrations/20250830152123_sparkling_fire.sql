/*
  # Add missing columns to presets table

  1. New Columns
    - `description` (text) - Description of the preset
    - `tags` (text array) - Tags for categorizing presets
    - `is_starred` (boolean) - Whether the preset is starred by the user
    - `is_public` (boolean) - Whether the preset is publicly visible
    - `usage_count` (integer) - Number of times the preset has been used
    - `updated_at` (timestamp) - Last update timestamp

  2. Security
    - Update existing RLS policies to work with new columns
    - Add policy for public preset access

  3. Changes
    - Add default values for all new columns
    - Ensure backward compatibility
*/

-- Add missing columns to presets table
DO $$
BEGIN
  -- Add description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'presets' AND column_name = 'description'
  ) THEN
    ALTER TABLE presets ADD COLUMN description text DEFAULT '';
  END IF;

  -- Add tags column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'presets' AND column_name = 'tags'
  ) THEN
    ALTER TABLE presets ADD COLUMN tags text[] DEFAULT '{}';
  END IF;

  -- Add is_starred column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'presets' AND column_name = 'is_starred'
  ) THEN
    ALTER TABLE presets ADD COLUMN is_starred boolean DEFAULT false;
  END IF;

  -- Add is_public column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'presets' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE presets ADD COLUMN is_public boolean DEFAULT false;
  END IF;

  -- Add usage_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'presets' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE presets ADD COLUMN usage_count integer DEFAULT 0;
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'presets' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE presets ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add policy for public presets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'presets' AND policyname = 'Users can view public presets'
  ) THEN
    CREATE POLICY "Users can view public presets"
      ON presets
      FOR SELECT
      TO public
      USING (is_public = true);
  END IF;
END $$;

-- Add policy for updating own presets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'presets' AND policyname = 'Users can update their own presets'
  ) THEN
    CREATE POLICY "Users can update their own presets"
      ON presets
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;