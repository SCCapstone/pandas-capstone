module.exports = {
    clearMocks: true,

    coverageDirectory: "coverage",
  
    coveragePathIgnorePatterns: ["/node_modules/"],
  
    moduleNameMapper: {
      "\\.(css|less)$": "identity-obj-proxy",
      "^axios$": "axios/dist/node/axios.cjs",
    },
  
    testMatch: [
      // "**/__tests__/**/*.[jt]s?(x)",
      "**/?(*.)+(spec|test).[tj]s?(x)",
    ],
    preset: "@vue/cli-plugin-unit-jest",
    transformIgnorePatterns: ["node_modules/(?!axios)"],
    testPathIgnorePatterns: ["/node_modules/"],

    verbose: true,
    setupFilesAfterEnv: ["./src/setupTests.js"],
  
  };
  