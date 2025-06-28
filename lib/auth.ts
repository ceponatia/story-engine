import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { DatabasePoolManager } from "./database/pool";

// Use unified pool manager for Better Auth
// Maintains all existing configuration while using centralized pool management
export const auth = betterAuth({
  database: DatabasePoolManager.getPool(),
  databaseType: "postgres",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000"
  ],
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
    fields: {
      emailVerified: "email_verified_boolean",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
    },
  },
  account: {
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Start with false for development
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  plugins: [
    nextCookies(), // Handle cookies for Next.js server actions
  ],
});

// Types are inferred from Better Auth automatically