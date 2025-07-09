#!/usr/bin/env node

import { betterAuth } from "better-auth";
import { DatabasePoolManager } from "../lib/postgres/pool.js";

// Use unified pool manager for scripts
const pool = DatabasePoolManager.getPool();

const auth = betterAuth({
  database: pool,
  databaseType: "postgres",
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
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
});

async function createTestUser() {
  try {
    const email = "claude-test@storyengine.com";
    const password = "TestPass123!";
    const name = "Claude Test User";

    console.log("Creating test user with Better Auth...");

    // Create user using Better Auth's built-in signUp method
    const result = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: name,
      },
    });

    console.log("✅ Test user created successfully");
    console.log("User ID:", result.user?.id);
    console.log("Email:", result.user?.email);
    console.log("Name:", result.user?.name);
  } catch (error) {
    console.error("❌ Error creating test user:", error);
  } finally {
    // Use unified pool manager's graceful shutdown
    await DatabasePoolManager.forceShutdown();
  }
}

// Run the script
createTestUser()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
