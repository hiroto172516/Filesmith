/*
  # Create presets table

  1. New Tables
    - `presets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `format` (text)
      - `parameters` (jsonb)
      - `tags` (text array)
      - `is_starred` (boolean)
      - `is_public` (boolean)
      - `usage_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `presets` table
    - Add policy for users to manage their own presets
    - Add policy for reading public presets
*/

CREATE TABLE IF NOT EXISTS presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  format text NOT NULL,
  parameters jsonb NOT NULL DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_starred boolean DEFAULT false,
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own presets"
  ON presets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public presets"
  ON presets
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE TRIGGER update_presets_updated_at
  BEFORE UPDATE ON presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);
CREATE INDEX IF NOT EXISTS idx_presets_public ON presets(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_presets_tags ON presets USING gin(tags);