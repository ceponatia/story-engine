declare const _default: {
    files: string[];
    plugins: {
        unicorn: import("eslint").ESLint.Plugin & {
            configs: {
                recommended: import("eslint").Linter.FlatConfig;
                all: import("eslint").Linter.FlatConfig;
                "flat/all": import("eslint").Linter.FlatConfig;
                "flat/recommended": import("eslint").Linter.FlatConfig;
            };
        };
        "@typescript-eslint": {
            configs: Record<string, import("@typescript-eslint/utils/ts-eslint").ClassicConfig.Config>;
            meta: import("@typescript-eslint/utils/ts-eslint").FlatConfig.PluginMeta;
            rules: typeof import("@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules");
        };
    };
    languageOptions: {
        parser: typeof typescriptParser;
        parserOptions: {
            ecmaVersion: number;
            sourceType: string;
        };
    };
    rules: {
        camelcase: (string | {
            properties: string;
        })[];
        "unicorn/filename-case": (string | {
            case: string;
            ignore: string[];
        })[];
    };
}[];
export default _default;
import typescriptParser from "@typescript-eslint/parser";
//# sourceMappingURL=eslint.config.d.mts.map