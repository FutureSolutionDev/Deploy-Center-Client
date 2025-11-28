import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // ==========================================
      // STRICT NAMING CONVENTIONS (PascalCase)
      // ==========================================
      '@typescript-eslint/naming-convention': [
        'error',
        // Allow quoted properties (like CSS-in-JS with "&:hover")
        {
          selector: 'objectLiteralProperty',
          modifiers: ['requiresQuotes'],
          format: null,
        },
        // Interfaces must start with "I" and be PascalCase
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        // Type aliases must be PascalCase
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          prefix: ['T'],
        },
        // Enums must be PascalCase with "E" prefix
        {
          selector: 'enum',
          format: ['PascalCase'],
          prefix: ['E'],
        },
        // Enum members must be PascalCase
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
        // Classes must be PascalCase
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        // Type parameters must be PascalCase
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
        },
        // Variables and functions: PascalCase or camelCase
        {
          selector: 'variable',
          format: ['PascalCase', 'camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        // Functions must be PascalCase or camelCase
        {
          selector: 'function',
          format: ['PascalCase', 'camelCase'],
        },
        // Parameters must be camelCase or PascalCase
        {
          selector: 'parameter',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // Properties can be camelCase or PascalCase
        {
          selector: 'property',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // Methods must be camelCase or PascalCase
        {
          selector: 'method',
          format: ['camelCase', 'PascalCase'],
        },
      ],

      // ==========================================
      // TYPESCRIPT STRICT RULES
      // ==========================================
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // ==========================================
      // SOLID PRINCIPLES ENFORCEMENT
      // ==========================================
      'max-lines': [
        'warn',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-lines-per-function': [
        'warn',
        {
          max: 450, // Realistic limit for React components with extensive JSX
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      '@typescript-eslint/no-empty-interface': 'warn',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../**/index'],
        },
      ],

      // ==========================================
      // OOP BEST PRACTICES
      // ==========================================
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/member-ordering': [
        'warn',
        {
          default: [
            'public-static-field',
            'protected-static-field',
            'private-static-field',
            'public-instance-field',
            'protected-instance-field',
            'private-instance-field',
            'constructor',
            'public-static-method',
            'protected-static-method',
            'private-static-method',
            'public-instance-method',
            'protected-instance-method',
            'private-instance-method',
          ],
        },
      ],
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public',
          },
        },
      ],

      // ==========================================
      // CODE QUALITY & BEST PRACTICES
      // ==========================================
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'object-shorthand': 'warn',
      'no-nested-ternary': 'warn',
      complexity: ['warn', 40],
      'max-depth': ['warn', 4],

      // ==========================================
      // REACT SPECIFIC RULES
      // ==========================================
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
)
