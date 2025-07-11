#!/usr/bin/env node

/**
 * CI/CD Environment Loading Validation Script
 *
 * Validates that all standalone Node.js scripts use the standardized
 * environment loading utility from @story-engine/utils
 *
 * Usage: node scripts/validate-env-loading.js
 */

const fs = require("fs");
const path = require("path");

const SCRIPTS_DIR = path.join(__dirname);
const REQUIRED_PATTERN = /loadEnv(ForScript)?/;
const FORBIDDEN_PATTERNS = [
  /require\(["']dotenv["']\)\.config/,
  /import.*dotenv.*config/,
  /from\s+["']dotenv["']/,
];

console.log("🔍 Validating environment loading patterns in scripts...\n");

// Get all JavaScript files in scripts directory
const scriptFiles = fs
  .readdirSync(SCRIPTS_DIR)
  .filter((file) => file.endsWith(".js") && file !== "validate-env-loading.js")
  .map((file) => path.join(SCRIPTS_DIR, file));

let hasErrors = false;
let validatedFiles = 0;

for (const scriptFile of scriptFiles) {
  const content = fs.readFileSync(scriptFile, "utf8");
  const relativePath = path.relative(process.cwd(), scriptFile);

  // Skip files that don't need environment loading
  if (!content.includes("process.env.") && !content.includes("DATABASE_URL")) {
    console.log(`⏭️  Skipped ${relativePath} (no environment usage detected)`);
    continue;
  }

  validatedFiles++;

  // Check for required pattern
  const hasStandardLoader = REQUIRED_PATTERN.test(content);

  // Check for forbidden patterns
  const hasForbiddenPattern = FORBIDDEN_PATTERNS.some((pattern) => pattern.test(content));

  if (!hasStandardLoader && hasForbiddenPattern) {
    console.error(`❌ ${relativePath}: Uses direct dotenv instead of @story-engine/utils loadEnv`);
    hasErrors = true;
  } else if (!hasStandardLoader) {
    console.error(`❌ ${relativePath}: Missing standardized environment loader`);
    console.error(`   Add: const { loadEnv } = require("@story-engine/utils/src/loadEnv");`);
    console.error(`   Add: loadEnv();`);
    hasErrors = true;
  } else if (hasForbiddenPattern) {
    console.error(`❌ ${relativePath}: Has both standard and direct dotenv usage`);
    hasErrors = true;
  } else {
    console.log(`✅ ${relativePath}: Using standardized environment loader`);
  }
}

console.log(`\n📊 Validation Summary:`);
console.log(`   Files validated: ${validatedFiles}`);
console.log(`   Files passed: ${validatedFiles - (hasErrors ? scriptFiles.length : 0)}`);

if (hasErrors) {
  console.error(`\n❌ Environment loading validation failed!`);
  console.error(`Fix the above issues and ensure all scripts use:`);
  console.error(`   const { loadEnv } = require("@story-engine/utils/src/loadEnv");`);
  console.error(`   loadEnv();`);
  process.exit(1);
} else {
  console.log(`\n✅ All scripts use standardized environment loading!`);
  process.exit(0);
}
