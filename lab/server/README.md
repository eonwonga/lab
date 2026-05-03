## Daraja Resolve Backend (Local Mock)

This lightweight Express server emulates `https://app.billnasi.com/endpoints/hs_resolve.php` for local development.

### Endpoints
- POST `/endpoints/hs_resolve.php` (multipart/form-data)
  - fields: `trx-code` (10 chars, A-Z0-9), `mac`
  - returns JSON with `response_type`: `processing`, `resolved`, or `error`

### Run
1. Open terminal in `server` directory
2. Install deps:
   ```bash
   npm install --no-audit --no-fund
   ```
3. Start server:
   ```bash
   npm start
   ```
4. The server listens on `http://localhost:4000` by default.

### Frontend Integration
Change your frontend POST target from:
`https://app.billnasi.com/endpoints/hs_resolve.php`

to your local server while developing:
`http://localhost:4000/endpoints/hs_resolve.php`

You can toggle back to production by reverting the URL.


