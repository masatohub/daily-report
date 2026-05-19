import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwindPlugin from "eslint-plugin-tailwindcss";
import unusedImports from "eslint-plugin-unused-imports";
import prettierConfig from "eslint-config-prettier";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Tailwind CSS クラスの順序・バリデーション
  // no-custom-classname は Tailwind v4 + shadcn の CSS 変数クラスで誤検知するため無効化
  {
    plugins: { tailwindcss: tailwindPlugin },
    rules: {
      ...tailwindPlugin.configs.recommended.rules,
      "tailwindcss/no-custom-classname": "off",
    },
  },

  // 未使用インポートをエラーとして検出
  {
    plugins: { "unused-imports": unusedImports },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],
    },
  },

  // Prettier と競合するフォーマットルールを無効化（末尾に置く）
  prettierConfig,

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
