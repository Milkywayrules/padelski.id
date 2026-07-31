import { type Tracer, trace } from "@opentelemetry/api";

export function initTelemetry(serviceName = "padelski-api"): Tracer {
  return trace.getTracer(serviceName);
}

export function getTracer(): Tracer {
  return trace.getTracer("padelski-api");
}
