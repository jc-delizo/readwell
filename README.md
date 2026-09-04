# ReadWell / BookNook

ReadWell is a full-stack MERN bookstore. This repository combines the original
Capstone 2 API and Capstone 3 React client into one installable, testable, and
deployable project. The publishable branch starts from a sanitized combined
snapshot; the source history remains available in the original GitLab projects.

## What is included

- A responsive customer storefront with search, dynamic genre filters, cart,
  checkout, and order history.
- An administrator area for books, fulfillment, and user roles.
- An Express 5 API with MongoDB, expiring JWT sessions, role/ownership checks,
  rate limiting, security headers, request validation, and server-side pricing.
- A Vite 8 + React 19 client served by Express in production.
- Automated API and UI tests plus GitHub Actions CI.

## Repository layout

```text
.
├── client/        React storefront and administrator UI
├── server/        Express API, Mongoose models, and API tests
├── package.json   npm workspaces and shared commands
└── Dockerfile     production container build
```

## Run locally

Requirements: Node 22.22+, npm 10.9+, and MongoDB 7+.

```bash
npm install
cp server/.env.example server/.env
npm run dev
```

Then open <http://localhost:5173>. Vite proxies API requests to the server on
<http://localhost:5020>, so no client environment variable is needed locally.

Set a unique `JWT_SECRET` of at least 32 characters in `server/.env`. To create
the first administrator in a new database, set `BOOTSTRAP_ADMIN_EMAIL` before
registering that address. Remove or keep the value private after bootstrap.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API and client with live reload |
| `npm run build` | Build the production client into `client/dist` |
| `npm start` | Start the API and serve the built client |
| `npm test` | Run server and client tests |
| `npm run lint` | Run ESLint across both workspaces |
| `npm run check` | Run lint, tests, and a production build |
| `npm run audit:production` | Audit production dependencies |

## Production

Provide these environment variables to the process or container:

- `MONGODB_URI` — MongoDB connection string.
- `JWT_SECRET` — unique secret with at least 32 characters.
- `PORT` — HTTP port; defaults to `5020`.
- `CLIENT_ORIGINS` — comma-separated browser origins when the UI is hosted
  separately. Same-origin deployments do not require it.
- `SHIPPING_FEE` — delivery fee in Philippine pesos; defaults to `100`.
- `BOOTSTRAP_ADMIN_EMAIL` — optional protected initial administrator address.

Build before starting when deploying without Docker:

```bash
npm ci
npm run build
NODE_ENV=production npm start
```

The health endpoint is `GET /api/health`.

## Original repositories

- Backend: <https://gitlab.com/batch-225-jc-delizo/capstone-2.git>
- Frontend: <https://gitlab.com/batch-225-jc-delizo/capstone-3.git>

They remain configured locally as `gitlab-backend` and `gitlab-frontend` for
provenance. This working clone also keeps an `imported-history` branch, while the
clean unified `main` branch is intended to be the source of truth.
