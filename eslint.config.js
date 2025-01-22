import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin-ts"
import typescriptEslint from "@typescript-eslint/eslint-plugin"

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
            "@stylistic/ts": stylistic,
        },
        files: ["**/*.{js,mjs,cjs,ts}"],
        rules: {
            "@stylistic/ts/indent": ["error", 4],
            "@stylistic/ts/quotes": ["error", "double"],
            "@stylistic/ts/semi": ["error", "never"],
        }
    },
    {languageOptions: { globals: globals.browser }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
]