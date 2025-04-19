import * as TailwindPlugin from 'prettier-plugin-tailwindcss'

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  bracketSpacing: true,
  tabWidth: 2,
  printWidth: 200,
  plugins: [TailwindPlugin],
}

export default config
