import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Ezek a modulok szándékosan exportálnak komponenseket és közös helper/variant
    // értékeket ugyanabból a fájlból. Más komponenseknél a Fast Refresh szabály
    // továbbra is aktív marad.
    files: [
      "src/components/site/FormFields.tsx",
      "src/components/site/Marketing.tsx",
      "src/components/site/ServiceLandingPage.tsx",
      "src/components/ui/badge.tsx",
      "src/components/ui/button.tsx",
      "src/components/ui/form.tsx",
      "src/components/ui/navigation-menu.tsx",
      "src/components/ui/sidebar.tsx",
      "src/components/ui/toggle.tsx",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // Ezek az admin oldalak a betöltő függvényt szándékosan csak mountkor
    // indítják. A szabály minden más React fájlban aktív marad.
    files: [
      "src/routes/admin.blog-history.$id.tsx",
      "src/routes/admin.cta.tsx",
      "src/routes/admin.leads.tsx",
      "src/routes/admin.navigation.tsx",
      "src/routes/admin.pricing.tsx",
      "src/routes/admin.project-history.$id.tsx",
      "src/routes/admin.projects.tsx",
      "src/routes/admin.testimonials.tsx",
      "src/routes/admin.why.tsx",
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
  eslintPluginPrettier,
);
