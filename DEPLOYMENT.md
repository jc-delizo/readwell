# ReadWell deployment

The production app runs as one Docker web service on Render. MongoDB Atlas
provides the database.

## Render service

- Repository: `https://github.com/jc-delizo/readwell`
- Branch: `main`
- Runtime: Docker
- Region: Singapore
- Health check: `/api/health`
- Service URL: `https://readwell-nodj.onrender.com`
- Blueprint: [`render.yaml`](./render.yaml)

## Runtime configuration

Configure secrets in the Render dashboard or API. Never commit their values to
this repository.

```dotenv
NODE_ENV=production
MONGODB_URI=mongodb+srv://<database-user>:<database-password>@<cluster-host>/readwell?appName=<cluster-name>
JWT_SECRET=<random-secret-with-at-least-32-characters>
JWT_EXPIRES_IN=1d
SHIPPING_FEE=100
BOOTSTRAP_ADMIN_EMAIL=admin@readwell.demo
```

Render supplies `PORT`, so it should not be hardcoded. Because Express serves
the built React client from the same origin, `CLIENT_ORIGINS` is not required.

MongoDB Atlas must allow the outbound IP ranges used by the Render service:

```text
74.220.52.0/24
74.220.60.0/24
```

## Credential handling

- Keep Render API keys temporary and revoke them after automation completes.
- Rotate database passwords that have been shared outside a secret manager.
- Keep only the non-secret credential inventory in [`CREDENTIALS.md`](./CREDENTIALS.md).
