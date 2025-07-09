-- Migration: Add user roles for role-based access control
-- Date: 2025-07-09
-- Description: Add role column to users table to support admin authorization

-- Add role column with default value 'user'
ALTER TABLE "user" ADD COLUMN role VARCHAR(50) DEFAULT 'user' NOT NULL;

-- Create index for efficient role-based queries
CREATE INDEX idx_user_role ON "user"(role);

-- Add comment for documentation
COMMENT ON COLUMN "user".role IS 'User role: user, admin';

-- Optional: Create a role constraint (uncomment if needed)
-- ALTER TABLE "user" ADD CONSTRAINT check_user_role CHECK (role IN ('user', 'admin'));