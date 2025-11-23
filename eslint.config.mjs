import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      'dist/',
      'release/',
      'node_modules/',
      'frontend/node_modules/',
      'frontend/dist/',
      'frontend/public/',
      'playwright-report/',
      'test-results/',
    ],
  },
  {
    files: ['electron/**/*.{ts,tsx}', '*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
  },
  {
    files: [
      '**/*.config.{js,ts,cjs,mjs}',
      'frontend/vite.config.ts',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
  },
  {
    files: ['frontend/src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
