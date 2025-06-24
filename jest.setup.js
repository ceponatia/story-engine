import '@testing-library/jest-dom'
import { loadEnvConfig } from '@next/env'

// Load environment variables for testing
const projectDir = process.cwd()
loadEnvConfig(projectDir)

// Add TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder

// Add missing DOM methods for jsdom compatibility with Radix UI
Object.defineProperty(window.Element.prototype, 'hasPointerCapture', {
  value: function () {
    return false
  },
  writable: true,
})

Object.defineProperty(window.Element.prototype, 'setPointerCapture', {
  value: function () {},
  writable: true,
})

Object.defineProperty(window.Element.prototype, 'releasePointerCapture', {
  value: function () {},
  writable: true,
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock scrollIntoView
Object.defineProperty(window.Element.prototype, 'scrollIntoView', {
  value: function () {},
  writable: true,
})

// Mock Supabase modules to avoid ESM issues
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      admin: {
        createUser: jest.fn(),
        deleteUser: jest.fn(),
      },
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: jest.fn((fn) => fn),
}))