const knex = require("knex");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Users Endpoints", function() {
  let db;

  const { testUsers } = helpers.makeRecordsFixtures();
  const testUser = testUsers[0];

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

  describe(`POST /migraine/users`, () => {
    context(`User Validation`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      const requiredFields = ["email", "password", "first_name", "last_name"];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          email: "testemail",
          password: "test password",
          first_name: "testfirst_name",
          last_name: "testlast_name"
        };
        it(`responds 400 'email already taken' when email isn't unique`, () => {
          const duplicateUser = {
            email: testUser.email,
            password: "11AAaa!!",
            first_name: "test first_name",
            last_name: "testlast_name"
          };
          return supertest(app)
            .post("/migraine/users")
            .send(duplicateUser)
            .expect(400, { error: `Email already taken` });
        });

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/migraine/users")
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in form.`
            });
        });

        it(`responds 400 'Password must be longer than 6 characters' when empty password`, () => {
          const userShortPassword = {
            email: "testemail",
            password: "12345",
            first_name: "testfirst_name",
            last_name: "testlast_name"
          };
          return supertest(app)
            .post("/migraine/users")
            .send(userShortPassword)
            .expect(400, {
              error: `Password must be longer than 6 characters`
            });
        });
        it(`responds 400 'Password must be less than 25 characters' when long password`, () => {
          const userLongPassword = {
            email: "testemail",
            password: "*".repeat(73),
            first_name: "testfirst_name",
            last_name: "testlast_name"
          };
          return supertest(app)
            .post("/migraine/users")
            .send(userLongPassword)
            .expect(400, { error: `Password must be less than 25 characters` });
        });

        it(`responds 400 error when password starts with spaces`, () => {
          const userPasswordStartsSpaces = {
            email: "test email",
            password: " 1Aa!2Bb@",
            first_name: "testfirst_name",
            last_name: "testlast_name"
          };
          return supertest(app)
            .post("/migraine/users")
            .send(userPasswordStartsSpaces)
            .expect(400, {
              error: `Password must not start or end with empty spaces`
            });
        });
        it(`responds 400 error when password ends with spaces`, () => {
          const userPasswordEndsSpaces = {
            email: "test email",
            password: "1Aa!2Bb@ ",
            first_name: "test first_name",
            last_name: "testlast_name"
          };
          return supertest(app)
            .post("/migraine/users")
            .send(userPasswordEndsSpaces)
            .expect(400, {
              error: `Password must not start or end with empty spaces`
            });
        });
      });
    });
    context(`Happy path`, () => {
      it(`responds 201, serialized user, storing bcrypted password`, () => {
        const newUser = {
          email: "testemail",
          password: "11AAaa!!",
          first_name: "testfirst_name",
          last_name: "testlast_name"
        };
        return supertest(app)
          .post("/migraine/users")
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property("id");
            expect(res.body.email).to.eql(newUser.email);
            expect(res.body.first_name).to.eql(newUser.first_name);
            expect(res.body.last_name).to.eql(newUser.last_name);
            expect(res.body).to.not.have.property("password");
            expect(res.headers.location).to.eql(
              `/migraine/users/${res.body.id}`
            );
          })
          .expect(res =>
            db
              .from("migraine_users")
              .select("*")
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.email).to.eql(newUser.email);
                expect(row.first_name).to.eql(newUser.first_name);
                expect(row.last_name).to.eql(newUser.last_name);

                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });
});
