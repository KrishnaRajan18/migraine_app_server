const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers.js");
const xss = require("xss");

const serializeRecord = record => ({
  id: record.id,
  intensity: record.intensity,
  location: record.location,
  onset: record.onset,
  symptom: record.symptom,
  time: record.time,
  trigger: record.trigger,
  symptom: record.symptom,
  treatment: record.treatment,
  comment: xss(record.comment)
});

describe("Records Endpoints", () => {
  let db;

  const { testUsers, testRecords } = helpers.makeRecordsFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe("GET /migraine/users/:user_id/records", () => {
    context(`Given no records`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        const validUser = testUsers[0];
        return supertest(app)
          .get(`/migraine/users/3/records`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200, []);
      });
    });

    context("Given there are records in the database", () => {
      beforeEach("insert records", () =>
        helpers.seedRecordsTables(db, testUsers, testRecords)
      );
    });
  });
});
