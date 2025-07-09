#!/usr/bin/env node
// Claude Code Auto-Format & Lint Hook for Story Engine
// Runs Prettier + ESLint on modified files for consistent code quality

import { spawn } from "node:child_process";
import { statSync } from "node:fs";
import { resolve, extname } from "node:path";

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const NPX_TIMEOUT_MS = 30000; // 30 seconds
const TARGET_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"];

/**
 * Executes a command and returns a promise
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    // Use shell only for npm/npx commands on Windows, otherwise avoid it for security
    const needsShell = process.platform === "win32" && (command === "npm" || command === "npx");

    const proc = spawn(command, args, {
      stdio: ["inherit", "pipe", "pipe"],
      shell: needsShell,
      ...options,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("error", (err) => reject(err));

    proc.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(`Command failed with exit code ${code}`);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      }
    });
  });
}

/**
 * Filters files based on extension, size, and path safety
 */
function filterTargetFile(filePath) {
  try {
    const absolutePath = resolve(process.cwd(), filePath);

    // Security: Prevent directory traversal
    if (!absolutePath.startsWith(process.cwd())) {
      return false;
    }

    // Skip node_modules
    if (absolutePath.includes("node_modules")) {
      return false;
    }

    // Check extension
    if (!TARGET_EXTENSIONS.includes(extname(absolutePath))) {
      return false;
    }

    // Check file size
    const stats = statSync(absolutePath);
    if (stats.size > MAX_FILE_SIZE_BYTES) {
      console.log(
        `⚠️  Skipping ${filePath} (${(stats.size / 1024 / 1024).toFixed(1)}MB > ${MAX_FILE_SIZE_MB}MB)`
      );
      return false;
    }

    return true;
  } catch (error) {
    // Skip files that can't be accessed
    return false;
  }
}

/**
 * Main hook execution
 */
async function main() {
  try {
    // Read hook input from stdin (Claude Code passes JSON data)
    let hookData = "";
    if (process.stdin.isTTY) {
      // Direct execution - use command line args as file paths
      const filePaths = process.argv.slice(2);
      if (filePaths.length === 0) {
        console.log("✅ No files specified for formatting");
        return;
      }
      hookData = JSON.stringify({ files: filePaths });
    } else {
      // Hook execution - read from stdin
      for await (const chunk of process.stdin) {
        hookData += chunk;
      }
    }

    let data;
    let targetFile;

    try {
      data = JSON.parse(hookData);
      // For Edit/Write/MultiEdit tools, get the file path
      targetFile = data.tool_input?.file_path || data.file_path;
    } catch {
      // Fallback: treat as direct file argument
      targetFile = hookData.trim();
    }

    if (!targetFile) {
      console.log("✅ No file to process");
      return;
    }

    // Filter the target file
    if (!filterTargetFile(targetFile)) {
      console.log(`✅ Skipping ${targetFile} (not a target file type)`);
      return;
    }

    console.log(`🎨 Auto-formatting: ${targetFile}`);

    let prettierSuccess = false;
    let eslintSuccess = false;

    // Step 1: Format with Prettier
    try {
      console.log("  ├─ Running Prettier...");

      // Try local prettier first, fallback to npx
      let prettierCommand = "npx";
      let prettierArgs = ["prettier", "--write", targetFile];

      try {
        // Check if prettier is locally installed
        await runCommand("npm", ["list", "prettier"], { timeout: 5000 });
        prettierCommand = "npm";
        prettierArgs = ["exec", "prettier", "--", "--write", targetFile];
      } catch {
        // Use npx if not locally installed
      }

      await runCommand(prettierCommand, prettierArgs, { timeout: NPX_TIMEOUT_MS });
      console.log("  ├─ ✅ Prettier completed");
      prettierSuccess = true;
    } catch (error) {
      console.log("  ├─ ⚠️  Prettier failed (continuing with ESLint)");
      if (error.stderr && !error.stderr.includes("No parser could be inferred")) {
        console.log(`      ${error.stderr.trim()}`);
      }
    }

    // Step 2: Lint with ESLint
    try {
      console.log("  ├─ Running ESLint...");
      await runCommand("npx", ["eslint", "--fix", "--max-warnings", "0", targetFile]);
      console.log("  └─ ✅ ESLint completed");
      eslintSuccess = true;
    } catch (error) {
      console.log("  └─ ⚠️  ESLint found issues (non-blocking)");
      // ESLint errors are often just warnings, so we don't show them unless critical
    }

    // Summary
    if (prettierSuccess && eslintSuccess) {
      console.log("🎉 File successfully formatted and linted!");
    } else if (prettierSuccess || eslintSuccess) {
      console.log("✅ Partial success - file partially processed");
    } else {
      console.log("⚠️  Could not process file - check output above");
    }
  } catch (error) {
    console.error("❌ Hook execution failed:", error.message);
    // Non-blocking: exit 0 to avoid interrupting workflow
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⏹️  Auto-format hook interrupted");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n⏹️  Auto-format hook terminated");
  process.exit(0);
});

main().catch((error) => {
  console.error("💥 Unexpected error:", error.message);
  process.exit(0); // Non-blocking exit
});
