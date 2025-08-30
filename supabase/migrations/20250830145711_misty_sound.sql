/*
  # Create generation jobs table

  1. New Tables
    - `generation_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `format` (text)
      - `parameters` (jsonb)
      - `status` (enum)
      - `progress` (integer)
      - `file_size` (bigint, nullable)
      - `file_hash` (text, nullable)
      - `storage_key` (text, nullable)
      - `expires_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `generation_jobs` table
    - Add policy for users to manage their own jobs
*/

CREATE TABLE IF NOT EXISTS generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  format text NOT NULL,
  parameters jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  file_size bigint,
  file_hash text,
  storage_key text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own generation jobs"
  ON generation_jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_generation_jobs_updated_at
  BEFORE UPDATE ON generation_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_created_at ON generation_jobs(created_at DESC);