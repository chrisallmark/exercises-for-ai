import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!\\.pnpm|marked/)",
    "/node_modules/.pnpm/(?!(marked)@)",
  ],
};

export default createJestConfig(config);
