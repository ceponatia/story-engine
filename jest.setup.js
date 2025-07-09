import "@testing-library/jest-dom";
import { loadEnvConfig } from "@next/env";

// Load environment variables for testing
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Add TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

// Add missing DOM methods for jsdom compatibility with Radix UI
Object.defineProperty(window.Element.prototype, "hasPointerCapture", {
  value: function () {
    return false;
  },
  writable: true,
});

Object.defineProperty(window.Element.prototype, "setPointerCapture", {
  value: function () {},
  writable: true,
});

Object.defineProperty(window.Element.prototype, "releasePointerCapture", {
  value: function () {},
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView
Object.defineProperty(window.Element.prototype, "scrollIntoView", {
  value: function () {},
  writable: true,
});

// TODO: Replace with PostgreSQL database mocks when needed
// Mock database connections for testing - removed to allow individual test mocking

// Mock Next.js modules
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: jest.fn((fn) => fn),
}));
