#!/usr/bin/env node

import { auth } from "../lib/auth.ts";

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
    console.log("User:", result.user);
    console.log("Session:", result.session);
  } catch (error) {
    console.error("❌ Login failed:", error);
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
