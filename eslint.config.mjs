import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,ts,mjs}"],
    ignores: ["dist/**", "node_modules/**", "frontend-enhanced/.next/**", ".next/**", "**/*.config.js"],
  }
);