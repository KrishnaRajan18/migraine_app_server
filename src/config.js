module.exports = {
  PORT: 9000,
  NODE_ENV: "development",
  CLIENT_ORIGIN: 3000,
  DATABASE_URL: "postgresql://localhost/migraine_app",
  TEST_DATABASE_URL: "postgresql://localhost/migraine_app_test",
  JWT_SECRET: "change-this-secret"
};

const { expect } = require("chai");
const supertest = require("supertest");

global.expect = expect;
global.supertest = supertest;
