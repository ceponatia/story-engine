#!/usr/bin/env node

import { auth } from '../lib/auth.ts';

async function createTestUser() {
  try {
    const email = 'claude-test@storyengine.com';
    const password = 'TestPass123!';
    const name = 'Claude Test User';

    console.log('Creating test user with Better Auth...');
    
    // Delete existing user first if it exists
    try {
      await auth.api.deleteUser({
        body: { userId: 'any' },
        query: { email: email }
      });
      console.log('Existing user deleted');
    } catch (error) {
      console.log('No existing user to delete');
    }

    // Create user using Better Auth's built-in signUp method
    const result = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: name
      }
    });

    console.log('✅ Test user created successfully:', result);
    console.log('Email:', email);
    console.log('Password:', password);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

// Run the script
createTestUser().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});