import {dirname} from "path";
import {fileURLToPath} from "url";
import {FlatCompat} from "@eslint/eslintrc";
import {defineConfig, globalIgnores} from "@eslint/config-helpers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * @type {import("eslint").Linter.Config[]}
 */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...defineConfig(globalIgnores(["./src/components/ui"], "Generated Files")),
];

export default eslintConfig;
