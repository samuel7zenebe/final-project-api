import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js, expressjs: "eslint-plugin-expressjs" },
    extends: ["js/recommended", "plugin:expressjs/recommended"],
    languageOptions: { globals: globals.browser },
  },
]);
