import tsparser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			"obsidianmd": obsidianmd,
		},
		rules: {
			// Obsidian-specific rules
			"obsidianmd/prefer-file-manager-trash-file": "warn",
			"obsidianmd/no-sample-code": "error",
			"obsidianmd/no-forbidden-elements": "error",
			"obsidianmd/validate-manifest": "error",

			// TypeScript rules
			"@typescript-eslint/no-unused-vars": ["warn", {
				"argsIgnorePattern": "^_",
				"varsIgnorePattern": "^_"
			}],
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},
	{
		ignores: [
			"dist/",
			"node_modules/",
			"*.config.mjs",
			"version-bump.mjs"
		],
	},
];
