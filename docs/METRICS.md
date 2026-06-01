# Metrics (Prometheus)

`@stratum/metrics` exposes Stratum runtime stats for Prometheus scraping.

## Install

```bash
pnpm add @stratum/metrics prom-client
```

## Wire to a bot

```ts
import { createStratumBot } from "@stratum/core";
import {
  attachClientMetrics,
  createPrometheusMetrics,
  createMetricsServer,
} from "@stratum/metrics";

const client = createStratumBot({ /* … */ });

const { register, collector } = createPrometheusMetrics();
const detach = attachClientMetrics(client, collector);

const metrics = await createMetricsServer({ port: 9090, register });
console.log(`Metrics at ${metrics.url}/metrics`);

await client.start();
```

Scrape `GET /metrics` (default path). `GET /health` returns `{ ok: true }`.

## Metrics

| Name | Type | Labels | Source |
|------|------|--------|--------|
| `stratum_commands_total` | Counter | `command`, `kind`, `outcome` | `commandSuccess`, `commandError`, `commandBlocked`, `commandDenied` |
| `stratum_command_duration_seconds` | Histogram | `command`, `kind` | Successful commands only |
| `stratum_piece_errors_total` | Counter | `piece`, `name` | Scout/hook/signal/chron/epilogue errors |
| `stratum_bot_ready` | Gauge | — | Client `ready` event |

Outcomes: `success`, `error`, `blocked`, `denied`.

## Testing without Prometheus

```ts
import { InMemoryMetrics, attachClientMetrics } from "@stratum/metrics";

const metrics = new InMemoryMetrics();
attachClientMetrics(client, metrics);
// inspect metrics.commands / metrics.errors in tests
```

## Environment (discord-bot example)

```bash
METRICS_PORT=9090 pnpm start
```
