-- ==============================================================================
-- THORAPPANKOCHUNNI - SUPABASE DATABASE & STORAGE SCHEMA
-- ==============================================================================
-- Run this entire script in your Supabase Dashboard -> SQL Editor -> Click "Run".
-- ==============================================================================

-- 1. Enable pgcrypto extension for secure bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create the app_passwords table
CREATE TABLE IF NOT EXISTS app_passwords (
  role TEXT PRIMARY KEY CHECK (role IN ('viewer', 'uploader', 'admin')),
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seed initial default passwords using standard bcrypt (Blowfish 'bf')
-- Default passwords:
--   - viewer   => viewer123
--   - uploader => uploader123
--   - admin    => admin123
-- (You can change these anytime either via SQL below or via the web app Admin Panel!)
INSERT INTO app_passwords (role, password_hash, updated_at)
VALUES
  ('viewer', crypt('viewer123', gen_salt('bf', 10)), NOW()),
  ('uploader', crypt('uploader123', gen_salt('bf', 10)), NOW()),
  ('admin', crypt('admin123', gen_salt('bf', 10)), NOW())
ON CONFLICT (role) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, updated_at = NOW();

-- ==============================================================================
-- HOW TO CHANGE PASSWORDS DIRECTLY VIA SQL IN SUPABASE:
-- ==============================================================================
-- To set your own passwords directly in SQL editor, simply run:
--
-- UPDATE app_passwords 
-- SET password_hash = crypt('YourNewViewerPassword', gen_salt('bf', 10)), updated_at = NOW() 
-- WHERE role = 'viewer';
--
-- UPDATE app_passwords 
-- SET password_hash = crypt('YourNewUploaderPassword', gen_salt('bf', 10)), updated_at = NOW() 
-- WHERE role = 'uploader';
--
-- UPDATE app_passwords 
-- SET password_hash = crypt('YourNewAdminPassword', gen_salt('bf', 10)), updated_at = NOW() 
-- WHERE role = 'admin';
-- ==============================================================================

-- 4. Create the posts table for files and notes
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  type TEXT NOT NULL CHECK (type IN ('file', 'text')),
  content TEXT,              -- Holds note text / code snippets
  file_url TEXT,            -- URL to the file in Supabase Storage
  file_name TEXT,           -- Original name of the uploaded file
  file_size BIGINT,         -- Size in bytes
  file_type TEXT,           -- MIME type (e.g. application/pdf, image/png)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast sorting by newest first
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- 5. Storage Bucket Setup:
-- Insert the storage bucket if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES ('thorappankochunni_files', 'thorappankochunni_files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to download files from the storage bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access to thorappankochunni_files'
  ) THEN
    CREATE POLICY "Public Access to thorappankochunni_files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'thorappankochunni_files');
  END IF;
END $$;
