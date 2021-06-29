# Migraine App

Migraine app helps the user to log in their episodes of migraine. It allows to user to select all the necessary information needed to have an overview of their attacks. They can view the frequent statistics of their most common location, triggers, etc, so that they get a better understanding of their symtoms and remedies.

**Home Page**

A new user can sign up or an existing user can log in.

**Dashboard**

Shows the user their most frequent attack record.

**Display Records**

Users can find all their logged information on this page.

**Record a Migraine**

Users can add a new record.

**Log Out Page**
User can log out.

## API Documentation

### Users Endpoints

_Private `/users/:user_id` endpoints require an `authorization` header with value of `bearer YOUR_AUTH_TOKEN_HERE` which is assigned upon signing up for an account._

### POST `migraine/users`

Adds a new user to the user database.

### POST `migraine/login`

Allows a user to "login" with their correct credentials. Returns the authToken,userId and userName which allows them access to their private information on the secure `/users/:user_id` .

### GET `migraine/users/:user_id/stats`

Returns the most frequent statistics of a users attack.

### GET `api/users/:user_id/records`

A logged-in user can access all of their records.

### DELETE `migraine/users/:user_id/records/:record_id`

Allows a logged-in user to delete a record using the `record_id` of the corresponding record.

A successful `DELETE` responds with `204 No Content`.

### POST `migraine/users/:user_id/records`

Allows a logged-in user to record a migraine with data.

## Technology Used

<b>Front End</b>

- HTML5
- CSS3
- JavaScript
- React

<b>Back End</b>

- Node.js
- Express.js
- PostgreSQL
- Mocha and Chai for testing
