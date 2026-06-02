# Native REST worker

Phase 16 promotes **`createNativeRestWorker`** from `@stratum/rest` as the default split-tier REST process.

---

## Architecture

```text
Gateway worker                    REST worker (@stratum/rest)
─────────────────                ────────────────────────────
HttpRestPort  ──POST /v1/rest──► createNativeRestWorker
  (core)         Bearer auth         RateLimitQueue → Discord API
```

Gateway code is unchanged: `HttpRestPort` + `REST_WORKER_URL` + optional `REST_WORKER_SECRET`.

---

## REST worker

```ts
import { createNativeRestWorker } from "@stratum/rest";
import { createPrometheusRestMetrics, restMetricsToTelemetry } from "@stratum/metrics";

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
| `stratum_rest_requests_total` | Counter | `method`, `route`, `status` |
| `stratum_rest_request_duration_seconds` | Histogram | `method`, `route` |
| `stratum_rest_rate_limits_total` | Counter | `bucket` |
| `stratum_rest_wait_duration_seconds` | Histogram | `bucket` |

Wire via `restMetricsToTelemetry(collector)` passed to `createNativeRestWorker({ telemetry })`. See [METRICS.md](./METRICS.md).

---

## Related

- [TRANSPORT.md](./TRANSPORT.md) — Phase 15 primitives
- [TIER_SPLIT.md](./TIER_SPLIT.md) — split tier overview
