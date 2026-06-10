# Metrics (Prometheus)

`@stambha/metrics` exposes Stambha runtime stats for Prometheus scraping.

## Install

```bash
pnpm add @stambha/metrics prom-client
```

## Wire to a bot

```ts
import { createStambhaBot } from "@stambha/core";
import {
  attachClientMetrics,
  createPrometheusMetrics,
  createMetricsServer,
} from "@stambha/metrics";

const client = createStambhaBot({ /* … */ });

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
| `stambha_commands_total` | Counter | `command`, `kind`, `outcome` | `commandSuccess`, `commandError`, `commandBlocked`, `commandDenied` |
| `stambha_command_duration_seconds` | Histogram | `command`, `kind` | Successful commands only |
| `stambha_piece_errors_total` | Counter | `piece`, `name` | Scout/hook/signal/chron/epilogue errors |
| `stambha_bot_ready` | Gauge | — | Client `ready` event |

Outcomes: `success`, `error`, `blocked`, `denied`.

## Testing without Prometheus

```ts
import { InMemoryMetrics, attachClientMetrics } from "@stambha/metrics";

const metrics = new InMemoryMetrics();
attachClientMetrics(client, metrics);
// inspect metrics.commands / metrics.errors in tests
```

## Environment

```bash
METRICS_PORT=9090 pnpm start
```

Attach metrics in your bot entrypoint with `attachClientMetrics(client, metrics)`.

## Native REST worker (tier split)

When running `createNativeRestWorker`, pass a REST telemetry adapter:

```ts
import { createNativeRestWorker } from "@stambha/rest";
import { createPrometheusRestMetrics, createMetricsServer, restMetricsToTelemetry } from "@stambha/metrics";

const { register, collector } = createPrometheusRestMetrics();
const worker = await createNativeRestWorker({
  token: process.env.DISCORD_TOKEN!,
  port: 4000,
  telemetry: restMetricsToTelemetry(collector),
});
await createMetricsServer({ port: 9091, register });
```

| Name | Type | Labels |
|------|------|--------|
| `stambha_rest_requests_total` | Counter | `method`, `route`, `status` |
| `stambha_rest_request_duration_seconds` | Histogram | `method`, `route` |
| `stambha_rest_rate_limits_total` | Counter | `bucket` |
| `stambha_rest_wait_duration_seconds` | Histogram | `bucket` |

See [NATIVE_REST.md](./NATIVE_REST.md).