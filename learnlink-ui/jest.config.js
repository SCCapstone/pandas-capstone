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
  extensionsToTreatAsEsm: ['.ts', '.tsx']
};