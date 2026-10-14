# AutoBrief

AutoBrief is a backend service that builds a personalised daily news briefing. Users sign up, choose the topics they care about, and receive an email digest of AI-summarised top headlines from those topics.

**Stack:** Node.js · TypeScript · Express 5 · TypeORM · MySQL · JWT · Joi · Nodemailer · NewsAPI · Hugging Face (BART) · Jest · Supertest

## How it works

1. **Sign up.** `POST /api/signup` validates the input (email, password strength, IANA timezone), hashes the password with bcrypt, and returns a JWT.
2. **Choose preferences.** `POST /api/userpreferences` (authenticated) stores the user's topics (business, entertainment, general, health, science, sports, technology) and delivery settings.
3. **Collect news.** The daily pipeline fetches the top headline in each category from NewsAPI, summarises it with Hugging Face's `facebook/bart-large-cnn` model, and stores it. Articles already in the database are skipped.
4. **Deliver digests.** Users who chose the same set of topics share one digest. Each distinct topic combination is built once per day, rendered to HTML (with escaping, since the content comes from a third-party API), and emailed to every matching user. If one email fails, the rest still go out.

## Architecture

```
route -> middleware (auth, validation) -> controller -> service -> repository -> MySQL
```

- **Layered design.** Controllers only translate HTTP requests into service calls, and all business logic lives in services. Services reach the database through `src/db/repositories.ts`, a single data-access layer that tests can mock.
- **Errors in one place.** Services throw a typed `HttpError`, and an error-handling middleware maps it to a response. Unexpected errors return a generic 500.
- **Validation at the edge.** Joi schemas validate and sanitise each request body before it reaches a controller.
- **Typed configuration.** `src/config/env.ts` is the only module that reads environment variables. The app refuses to start in production without a JWT secret.
- **Testable app.** `app.ts` builds the Express app with no side effects, and `index.ts` connects the database and starts listening. Tests drive the app in memory.

```
src/
  index.ts        entry point: connects the DB and starts the server
  app.ts          builds the Express app (routes + middleware), no side effects
  config/         typed configuration from environment variables
  routes/         URL -> middleware -> controller wiring
  controllers/    translate HTTP requests into service calls
  middleware/     auth, request validation, error handling
  validation/     Joi schemas and the input types they produce
  services/       business logic (users, preferences, articles, digests, email)
  db/             TypeORM data source and repository accessors
  models/         TypeORM entities
  utils/          small pure helpers (tokens, dates, HTML escaping)
tests/
  unit/           services, middleware, validation and utils in isolation
  http/           requests through the Express app with services mocked
```

## Data model

| Entity           | Purpose                                                                   |
| ---------------- | ------------------------------------------------------------------------- |
| `User`           | Account, hashed password, timezone; one-to-one with preferences           |
| `UsePreferences` | Chosen topics, delivery settings, and a canonical sorted topic key        |
| `Topic`          | News category; many-to-many with preferences, one-to-many with articles   |
| `Article`        | Headline, AI summary, source, unique URL                                  |
| `Digest`         | Rendered HTML for one topic combination per day, its articles and recipients |

## API

| Method | Path                   | Auth   | Description                          |
| ------ | ---------------------- | ------ | ------------------------------------ |
| POST   | `/api/signup`          | -      | Create an account, returns a JWT     |
| POST   | `/api/userpreferences` | Bearer | Create or replace topic preferences  |

```json
POST /api/userpreferences
{
  "topics": ["technology", "business"],
  "delivery_time": "08:00",
  "delivery_frequency": "daily",
  "delivery_method": "email"
}
```

## Testing

There are 97 Jest tests across 14 suites. Unit tests cover every service, middleware, validation schema and utility, with the database, news API, summariser and email transport mocked. HTTP tests use Supertest to send requests through the real Express app and check routing, authentication, validation and status codes.

```bash
npm test
npm run test:coverage
```

## Getting started

```bash
npm install
npm run dev        # start with nodemon
npm test           # run the test suite
npm run typecheck  # type-check src and tests
npm run build && npm start
```

Configuration is read from `.env` in `src/config/env.ts` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SYNC`, `TOKEN_SECRET`, `NEWS_API_KEY`, `ACCESS_TOKEN`, `SENDERMAIL`, `SENDERPASS`, `PORT`). Set `RUN_PIPELINE_ON_START=true` to fetch, summarise and email the daily digest when the server starts.

## Roadmap

- Run the pipeline on a schedule (cron), honouring each user's `delivery_time`, timezone and weekly frequency
- Webhook delivery alongside email
- Login endpoint and token refresh
- Database migrations instead of schema sync
