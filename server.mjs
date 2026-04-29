import crypto from "node:crypto";
import express from "express";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "reqrun-example-express-api",
      message: "Use POST /run to submit work through ReqRun and GET /requests/:id to check status.",
    });
  });

  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/run", async (req, res) => {
    try {
      const prompt = req.body?.prompt?.trim();

      if (!prompt) {
        return res.status(400).json({
          error: {
            message: "prompt is required",
            type: "invalid_request",
            code: "missing_prompt",
          },
        });
      }

      const response = await fetch(`${getReqRunBaseUrl()}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getReqRunApiKey()}`,
        },
        body: JSON.stringify({
          model: req.body?.model?.trim() || "gpt-5-nano",
          messages: [{ role: "user", content: prompt }],
          wait: req.body?.wait === true,
          idempotency_key: req.body?.idempotencyKey?.trim() || `express-${crypto.randomUUID()}`,
        }),
      });

      const payload = await response.json();
      return res.status(response.status).json(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({
        error: {
          message,
          type: "server_error",
          code: "reqrun_submission_failed",
        },
      });
    }
  });

  app.get("/requests/:id", async (req, res) => {
    try {
      const response = await fetch(`${getReqRunBaseUrl()}/v1/requests/${req.params.id}`, {
        headers: {
          Authorization: `Bearer ${getReqRunApiKey()}`,
        },
      });

      const payload = await response.json();
      return res.status(response.status).json(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({
        error: {
          message,
          type: "server_error",
          code: "reqrun_status_failed",
        },
      });
    }
  });

  return app;
}

function getReqRunBaseUrl() {
  return process.env.REQRUN_BASE_URL?.trim() || "https://api.reqrun.com";
}

function getReqRunApiKey() {
  const apiKey = process.env.REQRUN_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing REQRUN_API_KEY. Copy .env.example to .env and add your project key.");
  }

  return apiKey;
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], "file:").href) {
  const port = Number(process.env.PORT || 3000);
  const app = createApp();

  app.listen(port, () => {
    console.log(`ReqRun Express example listening on http://localhost:${port}`);
  });
}
