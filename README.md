# Talk Birdie To Me

A full-stack Golf Scoring application built with Hapi.js, Prisma, Postgres and React.

## Week 1 goals

- Backend setup
- Hapi server running
- Prisma scheme created
- Hosted Postgres connected
- CRUD for Scorecard
- Backend deployed
- External API Chosen

Setup instructions coming soon.

## Initial API (POST/GET) Testing

To check the backend setup, I tested bot the GET & POST endpoints using Postman - 29.07.26

### GET /rounds

Confirms the API successfully read data from Supabase

![GET rounds](./assets/postman-get.PNG)

### POST /rounds

Confirms a successful insert into the database with Prisma

![POST rounds](./assets/postman-post.PNG)

## Initial API (DELETE/PUT) Testing

To check the backend setup, I tested DELETE & PUT endpoints using Postman - 30.07.26

### DELETE /rounds/{id}

Confirms round deleted

![DELETE rounds](./assets/postman-delete.PNG)

### PUT /rounds/{id}

Confirms the round was updated successfully

![PUT rounds](./assets/postman-put.PNG)

## Branch: feature/crud-complete

Initial CRUD work completed

## Testing

The project is using Jest to test service logic.
Because it's written using ES Modules, the tests use Jest's ESM compatible mocking (jest.unstable.mockModule) and dynamic imports to ensure mocks are applied before the service is loaded.

### Mocking Prisma

This is done to prevent real database calls:

![Prisma Mock](./assets/prisma%20mock.PNG)

### roundService.getAllRounds()

![getAllRounds](./assets/getAllRounds.PNG)

### Testing Notes

- Tests run using the node flag --experimental-vm-modules for Jest's ESM support
- This setup was implemented with the assistance of Co-Pilot to correctly configure ESM mocking and dynamic imports

The following service methods are fully tested:

- getAllRounds - Returns rounds
- createRound - Creates round
- updateRound - Updates round
- deleteRound - Deletes round

## Backend Deployment Status

The backend API is now deployed and reachable via HTTPS on Railway

Base URL - https://talkbirdietome-production.up.railway.app

### GET /rounds

Returns all ronds stored in the Database

![getRounds](./assets/railway-rounds-get.PNG)

### POST /rounds

Creates a new round

![getRounds](./assets/railway-rounds-post.PNG)

### PUT /rounds/{id}

Updates an existing round

![putRounds](./assets/railway-rounds-put.PNG)

### DELETE /rounds/{id}

Deletes a round

![deleteRounds](./assets/railway-rounds-delete.PNG)

## Chosen API

### UK Golf Course Data API

![GolfUKApi](./assets/golfukapi.PNG)

### Successful response example

The request returned a list of matching clubs, including:

- Club ID
- Club name
- Address
- Region
- Country
- Associated courses

### Why this API?

- Covers 2,600+ UK golf clubs
- Provides hole data (par, yardage, stroke index)
- Supports search by location or course name
- Free tier sufficient for development

## Database Migration verification

After running Prisma migrations, the database schema was verified using SQL Editor in Supabase.
These checks confirm that the "User" and "Round" tables were created correctly and that the foreign key relationship between them is functioning as expected.

Test user was inserted into the database and returned when using a SELECT query:

![testUser](./assets/testuser.PNG)

A test round was then inserted against the user ID of the test user:

![testRound](./assets/testround.PNG)

I then verified the test round by searching from "Round" to check that the test round was stored correctly and can be retrieved:

![testRoundReturned](./assets/testroundreceived.PNG)
