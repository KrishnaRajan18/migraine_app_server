const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      email: "test-user-1",
      password: "password1",
      first_name: "test1"
    },
    {
      id: 2,
      email: "test-user-2",
      password: "password1",
      first_name: "test2"
    }
  ];
}

function makeRecordsArray() {
  return [
    {
      id: 1,
      user_id: 1,
      location: "Home",
      time: "Morning",
      onset: "Prodrome",
      intensity: 6,
      trigger: "lack of sleep",
      symptom: "prodrome",
      treatment: "caffeine",
      comment: "level 7 pain"
    },
    {
      id: 2,
      user_id: 2,
      location: "Home",
      time: "Morning",
      onset: "Prodrome",
      intensity: 8,
      trigger: "food",
      symptom: "aura",
      treatment: "medicine, sleep",
      comment: "came on while sleeping "
    },
    {
      id: 3,
      user_id: 1,
      location: "Home",
      time: "Morning",
      onset: "Prodrome",
      intensity: 4,
      trigger: "dehydration",
      symptom: "blurred vision, headache prior",
      treatment: "caffeine, medicine",
      comment: "dark room helped"
    }
  ];
}

function makeExpectedRecord(users, record = []) {
  const user = users.find(user => user.id == record.user_id);
  return {
    serializeRecord(record) {
      return {
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
      };
    }
  };
}

function makeRecordsFixtures() {
  const testUsers = makeUsersArray();
  const testRecords = makeRecordsArray(testUsers);
  return { testUsers, testRecords };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx
      .raw(
        `TRUNCATE
          migraine_records,
          migraine_users
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(
            `ALTER SEQUENCE migraine_records_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(
            `ALTER SEQUENCE migraine_users_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`SELECT setval('migraine_records_id_seq', 0)`),
          trx.raw(`SELECT setval('migraine_users_id_seq', 0)`)
        ])
      )
  );
}

function seedRecordsTables(db, users, records = []) {
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into("migraine_records").insert(records);

    await trx.raw(`SELECT setval('migraine_records_id_seq', ?)`, [
      records[records.length - 1].id
    ]);
  });
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into("migraine_users")
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('migraine_users_id_seq', ?)`, [
        users[users.length - 1].id
      ])
    );
}

function seedMaliciousrecord(db, user, record) {
  return seedUsers(db, [user]).then(() =>
    db.into("migraine_records").insert([record])
  );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: "HS256"
  });
  return `bearer ${token}`;
}

module.exports = {
  makeRecordsArray,
  makeRecordsFixtures,
  cleanTables,
  seedRecordsTables,
  seedMaliciousrecord,
  makeAuthHeader,
  seedUsers,
  makeExpectedRecord
};
