import eslintPluginUnicorn from "eslint-plugin-unicorn";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    plugins: {
      unicorn: eslintPluginUnicorn,
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    rules: {
      // ✅ Enforce camelCase for variables but allow snake_case in object properties
      camelcase: ["error", { properties: "never" }],

      // ✅ Enforce camelCase filenames (no kebab-case)
      "unicorn/filename-case": [
        "error",
        {
          case: "camelCase",
          ignore: ["^index\\.ts$"],
        },
      ],
    },
  },
];
