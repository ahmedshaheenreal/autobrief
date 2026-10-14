/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!src/models/**"],
};
