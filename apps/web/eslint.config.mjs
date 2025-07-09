import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),

  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      // ✅ Enforce camelCase for variables and object properties
      camelcase: ["error", { properties: "always" }],

      // ✅ Enforce camelCase filenames (no kebab-case)
      "unicorn/filename-case": [
        "error",
        {
          case: "camelCase",
          ignore: ["^index\\.ts$", "^layout\\.tsx$", "^page\\.tsx$", "^route\\.ts$", "^loading\\.tsx$", "^error\\.tsx$", "^not-found\\.tsx$"],
        },
      ],
    },
  },
];

export default eslintConfig;