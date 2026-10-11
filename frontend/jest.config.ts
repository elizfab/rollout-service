import type { Config } from 'jest';

/**
 * Testes unitários com Jest (nunca Jasmine/Karma).
 * Preset: jest-preset-angular, ambiente jsdom.
 */
const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@models/(.*)$': '<rootDir>/src/app/models/$1',
    '^@pages/(.*)$': '<rootDir>/src/app/pages/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
  },
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/index.ts',
    '!src/main.ts',
    '!src/environments/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'lcov', 'html'],
  coverageThreshold: {
    global: { statements: 80, branches: 70, functions: 75, lines: 80 },
  },
};

export default config;
