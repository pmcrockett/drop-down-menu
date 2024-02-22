"use strict";

import globals from "globals";
import underscorePlugin from "./eslint-plugin-require-param-underscore.js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  "eslint:recommended",
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      sourceType: "module",
      ecmaVersion: "latest",
    },
    plugins: { underscore: underscorePlugin },
    ignores: ["dist/main.js"],
    rules: {
      "underscore/require-param-underscore": "warn",
      "multiline-comment-style": ["warn", "separate-lines"],
      "no-lonely-if": "warn",
      "no-useless-concat": "warn",
      "prefer-const": ["warn", { destructuring: "all" }],
    },
  },
  eslintConfigPrettier,
];
