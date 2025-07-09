-- Better Auth PostgreSQL Schema
-- Generated based on Better Auth official documentation
-- This schema follows Better Auth best practices exactly

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Better Auth Tables
-- These tables are required for Better Auth to function properly

-- Table: user
-- Core user authentication and profile data
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  emailVerified BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: session
-- User session management and tracking
CREATE TABLE IF NOT EXISTS session (
  id TEXT NOT NULL PRIMARY KEY,
  expiresAt TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- Table: account
-- OAuth providers and email/password accounts
CREATE TABLE IF NOT EXISTS account (
  id TEXT NOT NULL PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt TIMESTAMPTZ,
  refreshTokenExpiresAt TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: verification
-- Email/phone verification and password reset tokens
CREATE TABLE IF NOT EXISTS verification (
  id TEXT NOT NULL PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TIMESTAMPTZ NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance optimization
-- Recommended by Better Auth documentation
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);

-- Comments for documentation
COMMENT ON TABLE "user" IS 'Better Auth core user table - stores user profile and authentication data';
COMMENT ON TABLE session IS 'Better Auth session table - manages user sessions and security tokens';
COMMENT ON TABLE account IS 'Better Auth account table - links users to OAuth providers and passwords';
COMMENT ON TABLE verification IS 'Better Auth verification table - handles email/phone verification and password resets';