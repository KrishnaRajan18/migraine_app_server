module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 3000,
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://localhost/migraine_app",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL || "postgresql://localhost/migraine_app_test",
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret"
};

const { expect } = require("chai");
const supertest = require("supertest");

global.expect = expect;
global.supertest = supertest;
