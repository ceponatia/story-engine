export default eslintConfig;
declare const eslintConfig: (import("eslint").Linter.Config<import("eslint").Linter.RulesRecord> | {
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
})[];
//# sourceMappingURL=eslint.config.d.mts.map