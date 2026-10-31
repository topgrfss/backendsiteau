# backendsiteau

Backend API service with item catalog, scan lookup, authentication, and inventory management.

## Features & Endpoints

- `POST /login` — Authenticate with role-based passwords (`admin`, `editor`, `viewer`) and receive bearer tokens.
- `GET /items/scan?code=<PLU>` — Look up items from `catalog.json` by PLU.
- `GET /items` — List items sorted by end date ascending and ID descending (Viewer+).
- `GET /items/:id` — Get item details by ID (Viewer+).
- `POST /items` — Create a new item with automatic catalog autofill and validation (Editor+).
- `PUT /items/:id` — Update existing item (Editor+).
- `DELETE /items/:id` — Delete item by ID (Admin).
- Honeypot routes (`/wp-admin`, `/wp-login.php`, `/.env`, etc.) returning status 418.

## Running the Application

```bash
npm install
npm run dev
```

Server listens on port 3000 (`0.0.0.0:3000`).
