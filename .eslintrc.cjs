module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@next/next/recommended"
  ],
  settings: {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".mjs", ".cjs", ".ts"]
      }
    }
  },
  env: {
    es2022: true,
    node: true
  },
  rules: {
    "import/extensions": ["error", "always", { "ignorePackages": true }]
  }
};