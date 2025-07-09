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

async function testLogin() {
  try {
    const email = "claude-test@storyengine.com";
    const password = "TestPass123!";

    console.log("Testing login with Better Auth...");

    // Test login using Better Auth's built-in signIn method
    const result = await auth.api.signInEmail({
      body: {
        email: email,
        password: password,
      },
    });

    console.log("✅ Login successful!");
    console.log("User ID:", result.user?.id);
    console.log("User Email:", result.user?.email);
    console.log("Session ID:", result.session?.id);
  } catch (error) {
    console.error("❌ Login failed:", error);
  } finally {
    // Use unified pool manager's graceful shutdown
    await DatabasePoolManager.forceShutdown();
  }
}

// Run the test
testLogin()
  .then(() => {
    console.log("Login test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Login test failed:", error);
    process.exit(1);
  });
