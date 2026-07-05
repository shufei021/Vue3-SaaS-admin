import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import pluginPrettier from "eslint-plugin-prettier/recommended";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },
  {
    name: "app/files-to-ignore",
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/auto-imports.d.ts",
      "**/components.d.ts",
    ],
  },
  ...pluginVue.configs["flat/recommended"],
  ...vueTsEslintConfig(),
  pluginPrettier,
  {
    rules: {
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "vue/no-v-html": "off",
    },
  },
];
