# ReqRun with Express

Runnable Express example that accepts app requests and hands the model call off to ReqRun.

## What this repo shows

- a local Express API endpoint at `POST /run`
- a status lookup endpoint at `GET /requests/:id`
- server-side use of the ReqRun project API key
- async request ids and idempotency keys without adding retry logic to Express itself

## Prerequisites

- Node.js 20+
- a ReqRun project API key from [https://app.reqrun.com](https://app.reqrun.com)

## Setup

1. Copy the env template:

```bash
cp .env.example .env
```

2. Fill in:

```env
REQRUN_API_KEY=REQRUN_LIVE_YOUR_PROJECT_KEY_HERE
REQRUN_BASE_URL=https://api.reqrun.com
PORT=3000
```

3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

## Example request

```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain why idempotency matters for AI jobs.",
    "idempotencyKey": "express-demo-001",
    "wait": false
  }'
```

If ReqRun returns an async object, check status later:

```bash
curl http://localhost:3000/requests/rr_your_request_id_here
```

## ReqRun docs

- Product docs: [https://www.reqrun.com/docs](https://www.reqrun.com/docs)
- Quickstart: [https://www.reqrun.com/docs/quickstart](https://www.reqrun.com/docs/quickstart)
- API reference: [https://www.reqrun.com/docs/api](https://www.reqrun.com/docs/api)
