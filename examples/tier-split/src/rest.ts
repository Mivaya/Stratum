import { createMetricsServer, createPrometheusRestMetrics, restMetricsToTelemetry } from "@stratum/metrics";
import { createNativeRestWorker } from "@stratum/rest";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("Set DISCORD_TOKEN.");
  process.exit(1);
}

const port = Number(process.env.REST_WORKER_PORT ?? 4000);
const secret = process.env.REST_WORKER_SECRET;
const metricsPort = process.env.METRICS_PORT ? Number(process.env.METRICS_PORT) : 0;

const { register, collector } = createPrometheusRestMetrics();
const telemetry = restMetricsToTelemetry(collector);

const worker = await createNativeRestWorker({
  token,
  port,
  secret: secret || undefined,
  telemetry,
});

console.log(`Native REST worker listening on ${worker.url}`);

let metricsServer: Awaited<ReturnType<typeof createMetricsServer>> | undefined;
if (metricsPort > 0) {
  metricsServer = await createMetricsServer({ port: metricsPort, register });
  console.log(`REST metrics at ${metricsServer.url}/metrics`);
}

process.on("SIGINT", async () => {
  await metricsServer?.close();
  await worker.close();
  process.exit(0);
});
