module.exports = {
  preset: 'ts-jest/presets/default-esm',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.jest.json' // Optional separate config
      }
    ]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^axios$': '<rootDir>/node_modules/axios/dist/axios.js',
    '^react-select$': '<rootDir>/node_modules/react-select/dist/react-select.js'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)'
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  // Add these worker-related configurations
  workerIdleMemoryLimit: '500MB',      // How much memory a worker can consume before being restarted
  maxWorkers: '50%',                   // Use 50% of available CPU cores
  detectOpenHandles: true,             // Helps identify async operations that weren't stopped
  forceExit: true,                     // Force Jest to exit after tests complete
  testTimeout: 30000,                  // Increase timeout if tests are slow
  
};