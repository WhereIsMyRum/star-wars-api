module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  rootDir: '../',
  testRegex: '.e2e.spec.ts$',
  transform: {
    '.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'node',
  testTimeout: 100000,
};
