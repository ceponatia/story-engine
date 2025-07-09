# @story-engine/auth

Authentication package providing user session management, authentication utilities, and security helpers for Story Engine.

## Features

- **Better Auth Integration**: Modern authentication with session management
- **Session Utilities**: Helper functions for user session handling
- **User Management**: User retrieval and authentication state management
- **Security Helpers**: Authentication guards and permission checking

## Components

### Core Authentication
- `auth.ts` - Better Auth configuration and setup
- `auth-client.ts` - Client-side authentication utilities
- `auth-helper.ts` - Server-side authentication helpers and session management

## Usage

```typescript
import { getCurrentUser, requireAuth } from '@story-engine/auth';
import { auth } from '@story-engine/auth/auth';

// Get current user (nullable)
const user = await getCurrentUser();

// Require authentication (throws if not authenticated)
const { user, session } = await requireAuth();

// Use Better Auth directly
const sessionData = await auth.api.getSession({ headers });
```

## Session Management

The package provides utilities for:
- Getting current user and session
- Requiring authentication with error handling
- User retrieval by ID
- Session validation

## Security

- Built on Better Auth for modern security practices
- Session-based authentication
- Secure cookie handling
- CSRF protection

## Configuration

Requires environment variables:
- `BETTER_AUTH_SECRET` - Secret key for session encryption
- `DATABASE_URL` - PostgreSQL connection for user storage