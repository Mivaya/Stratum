# Native REST worker

For split-tier deployments, **`createNativeRestWorker`** from `@stambha/rest` is the recommended REST process — centralized rate limits and optional Prometheus telemetry.

---

## Architecture

```text
Gateway worker                    REST worker (@stambha/rest)
─────────────────                ────────────────────────────
HttpRestPort  ──POST /v1/rest──► createNativeRestWorker
  (core)         Bearer auth         RateLimitQueue → Discord API
```

Gateway code is unchanged: `HttpRestPort` + `REST_WORKER_URL` + optional `REST_WORKER_SECRET`.

---

## REST worker

```ts
import { createNativeRestWorker } from "@stambha/rest";
import { createPrometheusRestMetrics, restMetricsToTelemetry } from "@stambha/metrics";

const { collector } = createPrometheusRestMetrics();

const worker = await createNativeRestWorker({
  token: process.env.DISCORD_TOKEN!,
  port: 4000,
  secret: process.env.REST_WORKER_SECRET,
  telemetry: restMetricsToTelemetry(collector),
});

console.log(worker.url); // http://127.0.0.1:4000
```

### Endpoints (same as core `createRestWorkerServer`)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/health` | GET | — | Liveness `{ ok: true }` |
| `/v1/rest` | POST | Bearer (when `secret` set) | Execute {@link RestRequest} |

---

## Run the bot example

```bash
cd examples/bot
pnpm split:rest
```

Or monolith: `pnpm start` / `pnpm demo`.

---

## Prometheus metrics

| Name | Type | Labels |
|------|------|--------|
| `stambha_rest_requests_total` | Counter | `method`, `route`, `status` |
| `stambha_rest_request_duration_seconds` | Histogram | `method`, `route` |
| `stambha_rest_rate_limits_total` | Counter | `bucket` |
| `stambha_rest_wait_duration_seconds` | Histogram | `bucket` |

Wire via `restMetricsToTelemetry(collector)` passed to `createNativeRestWorker({ telemetry })`. See [Metrics](/deployment/metrics).

---

## Related

- [Transport](/reference/transport) — session info and route primitives
- [Tier split](/deployment/tier-split) — split tier overview
