import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/adapters/next-js";
import { getDatabase } from "@story-engine/postgres";

// Better Auth configuration following official best practices
// Using camelCase field names as per Better Auth standards
export const auth = betterAuth({
  database: getDatabase(),
  databaseType: "postgres",
  secret: process.env.BETTER_AUTH_SECRET || "",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",
  ],
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
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
