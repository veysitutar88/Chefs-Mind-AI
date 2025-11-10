import { beforeAll } from 'vitest';

beforeAll(() => {
  // Set up any global mocks or test environment variables here
  process.env.NODE_ENV = 'test';
  console.log('Starting tests in "test" environment...');
});
