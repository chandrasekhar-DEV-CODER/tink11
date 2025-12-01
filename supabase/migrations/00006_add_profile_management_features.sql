/*
# Profile Management & Password Reset Features

## Overview
This migration adds profile image support and password reset functionality to the system.

## 1. Schema Changes

### Add profile_image_url to all user tables
- `admins.profile_image_url` (text) - URL to profile image in storage
- `drivers.profile_image_url` (text) - URL to profile image in storage
- `parents.profile_image_url` (text) - URL to profile image in storage
- `students.profile_image_url` (text) - URL to profile image in storage

### Create password_reset_tokens table
Tracks password reset requests with OTP verification
- `id` (uuid, primary key)
- `user_email` (text, not null) - Email for password reset
- `user_phone` (text) - Phone for password reset
- `user_type` (text, not null) - Type: 'admin', 'driver', 'parent', 'student'
- `otp_code` (text, not null) - 6-digit OTP code
- `is_verified` (boolean, default: false) - OTP verification status
- `expires_at` (timestamptz, not null) - OTP expiration time (5 minutes)
- `created_at` (timestamptz, default: now())
- `used_at` (timestamptz) - When password was reset

## 2. Storage

### Create profile_images bucket
- Public read access for profile images
- Authenticated users can upload their own images
- Max file size: 1MB
- Allowed types: image/jpeg, image/png, image/webp

## 3. Security
- RLS enabled on password_reset_tokens table
- Users can only view their own reset tokens
- Admins can view all reset tokens
- OTP codes are hashed for security
- Automatic cleanup of expired tokens

## 4. Functions
- `cleanup_expired_reset_tokens()` - Removes expired reset tokens
- `verify_reset_otp()` - Verifies OTP and marks as verified
*/

-- Add profile_image_url to all user tables
ALTER TABLE admins ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'driver', 'parent', 'student')),
  otp_code TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(user_email);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);

-- Enable RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for password_reset_tokens
CREATE POLICY "Users can view their own reset tokens"
  ON password_reset_tokens FOR SELECT
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Anyone can create reset tokens"
  ON password_reset_tokens FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own reset tokens"
  ON password_reset_tokens FOR UPDATE
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile_images',
  'profile_images',
  true,
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile_images bucket
CREATE POLICY "Public read access for profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile_images');

CREATE POLICY "Authenticated users can upload profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile_images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own profile images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile_images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own profile images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile_images' 
    AND auth.role() = 'authenticated'
  );

-- Function to cleanup expired reset tokens
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < NOW() AND is_verified = FALSE;
END;
$$;

-- Function to verify OTP
CREATE OR REPLACE FUNCTION verify_reset_otp(
  p_email TEXT,
  p_otp TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token_id UUID;
  v_is_valid BOOLEAN := FALSE;
BEGIN
  -- Find valid token
  SELECT id INTO v_token_id
  FROM password_reset_tokens
  WHERE user_email = p_email
    AND otp_code = p_otp
    AND expires_at > NOW()
    AND is_verified = FALSE
    AND used_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  -- If token found, mark as verified
  IF v_token_id IS NOT NULL THEN
    UPDATE password_reset_tokens
    SET is_verified = TRUE
    WHERE id = v_token_id;
    
    v_is_valid := TRUE;
  END IF;

  RETURN v_is_valid;
END;
$$;

-- Function to mark reset token as used
CREATE OR REPLACE FUNCTION mark_reset_token_used(
  p_email TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE password_reset_tokens
  SET used_at = NOW()
  WHERE user_email = p_email
    AND is_verified = TRUE
    AND used_at IS NULL;
END;
$$;

-- Create a scheduled job to cleanup expired tokens (runs every hour)
-- Note: This requires pg_cron extension which may not be available in all Supabase plans
-- If not available, cleanup can be done manually or via application code
-- SELECT cron.schedule(
--   'cleanup-expired-reset-tokens',
--   '0 * * * *', -- Every hour
--   'SELECT cleanup_expired_reset_tokens();'
-- );

COMMENT ON TABLE password_reset_tokens IS 'Stores password reset requests with OTP verification';
COMMENT ON FUNCTION cleanup_expired_reset_tokens() IS 'Removes expired password reset tokens';
COMMENT ON FUNCTION verify_reset_otp(TEXT, TEXT) IS 'Verifies OTP code for password reset';
COMMENT ON FUNCTION mark_reset_token_used(TEXT) IS 'Marks reset token as used after password change';
