const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.turbo/**",
      "reports/**",
      "logs/**"
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
];