// Prayer times are device-local strings, so pin the zone to keep tests deterministic.
process.env.TZ = "America/Chicago";

/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: [
    "<rootDir>/test/setupEnv.js",
    "react-native-gesture-handler/jestSetup",
  ],
  setupFilesAfterEnv: ["<rootDir>/test/setup.tsx"],
  // Tests live outside app/ because expo-router treats every file there as a route.
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/test/styleMock.js",
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
};
