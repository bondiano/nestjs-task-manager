import type { JestConfigWithTsJest } from 'ts-jest';

export default {
  preset: 'ts-jest',
  displayName: 'api',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['@relmify/jest-fp-ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage',
  reporters: ['default'],
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/migrations/*.ts',
    '!src/**/*.seed.ts',
    '!src/**/*.factory.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.response.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/repl.ts',
    '!src/commander.ts',
    '!test/**/*.ts',
  ],
  testTimeout: 15_000, // 15 seconds
} satisfies JestConfigWithTsJest;
