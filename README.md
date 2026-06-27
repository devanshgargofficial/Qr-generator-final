# 🎶 Club QR Generator

Generate & save QR codes for your clubs — backed by MongoDB (nerolifedb).

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI
   ```

3. **Start the server**
   ```bash
   npm start
   # or for dev with auto-reload:
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3001
   ```

## Project Structure

```
qr-generator/
├── server.js          ← Express backend + MongoDB
├── package.json
├── .env               ← Your config (never commit)
├── .env.example       ← Template
└── public/
    ├── index.html     ← Frontend
    └── qr-codes/      ← Generated QR PNGs saved here
```

## Environment Variables

| Variable    | Default                              | Description              |
|-------------|--------------------------------------|--------------------------|
| PORT        | 3001                                 | Server port              |
| MONGO_URI   | mongodb://localhost:27017/nerolifedb | MongoDB connection string |
| BASE_URL    | http://localhost:3001                | Base URL for QR codes    |

## API Endpoints

| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| GET    | /api/qr-records           | Get all saved QR records        |
| GET    | /api/qr-records/:clubId   | Check if a club QR exists       |
| POST   | /api/generate             | Generate & save one club QR     |
| POST   | /api/generate-all         | Generate & save all clubs       |
| DELETE | /api/qr-records/:clubId   | Delete a club QR record         |
