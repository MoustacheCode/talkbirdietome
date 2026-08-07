export default {
    testEnvironment: "node", // Specifies the test environment as Node.js
    setupFilesAfterEnv: ["<rootDir>/tests/setupTestDB.js"], // Runs setupTestDB.js after the test environment is set up
};
