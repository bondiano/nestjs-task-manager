import type { JestConfigWithTsJest } from 'ts-jest';

export default {
  displayName: 'api',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  setupFilesAfterEnv: ['@relmify/jest-fp-ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage',
  reporters: ['default'],
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
