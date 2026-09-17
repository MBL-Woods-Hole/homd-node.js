import js from "@eslint/js";
//import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ENV: "readonly",
        Buffer: "readonly",
        console: "readonly",
        document: "readonly",
        process: "readonly",
        setTimeout: "readonly",
      },
    },
  },
]);
