const knex = require("knex");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Auth Endpoints", function() {
  let db;

  const { testUsers } = helpers.makeRecordsFixtures();
  const testUser = testUsers[0];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: "postgresql://localhost/migraine_app_test"
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`POST /migraine/login`, () => {
    beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

    const requiredFields = ["email", "password"];

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        email: testUser.email,
        password: testUser.password
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post("/migraine/login")
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in form`
          });
      });
    });

    it(`responds 400 'invalid email `, () => {
      const userInvalidUser = { email: "user-not", password: "existy" };
      return supertest(app)
        .post("/migraine/login")
        .send(userInvalidUser)
        .expect(400, { error: `Email not registered` });
    });

    it(`responds 400 'invalid  password' `, () => {
      const userInvalidPass = { email: testUser.email, password: "incorrect" };
      return supertest(app)
        .post("/migraine/login")
        .send(userInvalidPass)
        .expect(400, { error: `Invalid password` });
    });

    it(`responds 200 when valid credentials`, () => {
      const userValidCreds = {
        email: testUser.email,
        password: testUser.password
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.email,
          algorithm: "HS256"
        }
      );
      return supertest(app)
        .post("/migraine/login")
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken,
          userId: testUser.id,
          userName: testUser.first_name
        });
    });
  });
});
