import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import filenameCamelOrDotCase from "./eslint-rules/filename-camel-or-dotcase.js";

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
      custom: {
        rules: {
          "filename-camel-or-dotcase": filenameCamelOrDotCase,
        },
      },
    },
    rules: {
      // ✅ Enforce camelCase for variables but allow snake_case in object properties
      camelcase: ["error", { properties: "never" }],

      // ✅ Enforce camelCase or dot.case filenames (no kebab-case or snake_case)
      "custom/filename-camel-or-dotcase": "error",
    },
  },
];

export default eslintConfig;
