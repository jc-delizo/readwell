# ReadWell credential inventory

This file is intentionally tracked, but it must never contain live passwords,
API keys, access tokens, or complete connection strings. Repository visibility
is not a substitute for a secret manager, and removed Git values remain in
commit history.

| Credential | Stored in | Repository value | Rotation action |
| --- | --- | --- | --- |
| MongoDB Atlas URI | Render environment | `MONGODB_URI=<redacted>` | Rotate the Atlas database-user password, then update Render. |
| JWT signing secret | Render environment | `JWT_SECRET=<generated-by-render>` | Generate a new value in Render; existing sessions will be signed out. |
| Render API key | Not retained | `RENDER_API_KEY=<revoked-after-use>` | Revoke the temporary key in Render Account Settings. |
| GitHub credential | Not retained | `GITHUB_TOKEN=<revoked-after-use>` | Revoke temporary tokens in GitHub Developer Settings. |

The non-secret Render settings and environment-variable names are documented in
[`DEPLOYMENT.md`](./DEPLOYMENT.md). Never paste replacement credential values
into this file.
