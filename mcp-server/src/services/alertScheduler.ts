import { getCollection } from './mongo.js';
import { evaluateAndPersist, setEngineState } from './alertService.js';
import { redactText } from './redaction.js';

const LEASE_COLLECTION = 'mcp_config';
const LEASE_DOC = 'alertSchedulerLease';
const HOST_ID = `${process.pid}-${Math.random().toString(36).slice(2, 8)}`;

let timer: NodeJS.Timeout | null = null;
let startupTimer: NodeJS.Timeout | null = null;
let running = false;

export function alertSchedulerIntervalMs(): number {
  const raw = parseInt(process.env.MCP_ALERTS_INTERVAL_MS || '60000', 10);
  return Number.isFinite(raw) && raw >= 10000 ? raw : 60000;
}

export function alertSchedulerEnabled(): boolean {
  const raw = (process.env.MCP_ALERTS_SCHEDULER_ENABLED || '').trim().toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  return true;
}

/** Acquire a short Mongo lease so only one instance evaluates at a time. */
async function acquireLease(now: number): Promise<boolean> {
  try {
    const col = await getCollection(LEASE_COLLECTION);
    const leaseUntil = now + alertSchedulerIntervalMs() * 2;
    const res = await col.updateOne(
      { _id: LEASE_DOC, leaseUntil: { $lt: now } },
      { $set: { leaseUntil, owner: HOST_ID, updatedAt: now } },
    );
    if (res.matchedCount > 0) return true;
    const existing = await col.findOne({ _id: LEASE_DOC });
    if (!existing) {
      try {
        await col.insertOne({ _id: LEASE_DOC, leaseUntil, owner: HOST_ID, updatedAt: now } as any);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  } catch {
    // If the lease store is unavailable, still allow evaluation (single-instance
    // Render deployment) rather than disabling alerts entirely.
    return true;
  }
}

export async function runAlertEvaluationOnce(): Promise<void> {
  if (running) return;
  running = true;
  const now = Date.now();
  try {
    if (await acquireLease(now)) {
      await evaluateAndPersist(now);
    }
  } catch (error: any) {
    console.error('[Alerts] evaluation failed:', redactText(error?.message || error));
    await setEngineState({ at: Date.now(), ok: false, error: redactText(error?.message || error) });
  } finally {
    running = false;
  }
}

export function startAlertScheduler(): void {
  if (timer || startupTimer) return;
  if (!alertSchedulerEnabled()) {
    console.log('[Alerts] Scheduler disabled (MCP_ALERTS_SCHEDULER_ENABLED=false)');
    return;
  }
  const interval = alertSchedulerIntervalMs();
  startupTimer = setTimeout(() => {
    void runAlertEvaluationOnce();
  }, 15000);
  if (typeof startupTimer.unref === 'function') startupTimer.unref();
  timer = setInterval(() => {
    void runAlertEvaluationOnce();
  }, interval);
  if (typeof timer.unref === 'function') timer.unref();
  console.log(`[Alerts] Scheduler started (every ${Math.round(interval / 1000)}s)`);
}

export function stopAlertScheduler(): void {
  if (startupTimer) {
    clearTimeout(startupTimer);
    startupTimer = null;
  }
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
