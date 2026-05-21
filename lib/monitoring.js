import { apiLogger } from "./logger";

// Simple in-memory rate-based alerting for API error spikes
const windowMs = 60 * 1000; // 1 minute
const thresholds = {
  errorCountPerWindow: 20, // >20 errors per minute triggers warning
};

// Map endpoint -> array of { ts, status }
const events = new Map();

export function recordApiResponse(endpoint, status) {
  try {
    const now = Date.now();
    if (!events.has(endpoint)) events.set(endpoint, []);
    const arr = events.get(endpoint);
    arr.push({ ts: now, status });
    // purge old
    while (arr.length && now - arr[0].ts > windowMs) arr.shift();

    // count 4xx/5xx
    const errorCount = arr.filter((e) => e.status >= 400).length;
    if (errorCount > thresholds.errorCountPerWindow) {
      apiLogger.warn("Spike detected on endpoint", { endpoint, errorCount });
      // TODO: hook into external alerting (Sentry/PagerDuty) here
    }
  } catch (err) {
    apiLogger.error("Monitoring failure", err, { endpoint, status });
  }
}
