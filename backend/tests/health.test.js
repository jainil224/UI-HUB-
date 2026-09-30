import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    buildHealthReport,
    httpStatusFor,
    HEALTHY,
    DEGRADED,
    UNHEALTHY,
    HEALTH_MESSAGE,
} from '../src/services/healthService.js';

const noRedis = { configured: false, connected: false };
const withRedis = { configured: true, connected: true };
const dbUp = async () => true;
const dbDown = async () => false;

test('healthy when mongo is reachable and mcp is mounted', async () => {
    const report = await buildHealthReport({ mcpMounted: true, redis: noRedis, probeDatabase: dbUp });
    assert.equal(report.status, HEALTHY);
    assert.equal(report.httpStatus, 200);
    assert.equal(report.body.services.backend, 'online');
    assert.equal(report.body.services.mcp, 'online');
    assert.equal(report.body.dependencies.mongodb, 'connected');
    assert.equal(report.body.dependencies.mcp, 'mounted');
});

test('degraded but still 200 when mcp failed to mount', async () => {
    const report = await buildHealthReport({ mcpMounted: false, redis: noRedis, probeDatabase: dbUp });
    assert.equal(report.status, DEGRADED);
    assert.equal(report.httpStatus, 200);
    assert.equal(report.body.services.backend, 'online');
    assert.equal(report.body.services.mcp, 'offline');
    assert.equal(report.body.dependencies.mcp, 'not_mounted');
});

test('unhealthy and 503 when mongo is unreachable', async () => {
    const report = await buildHealthReport({ mcpMounted: true, redis: noRedis, probeDatabase: dbDown });
    assert.equal(report.status, UNHEALTHY);
    assert.equal(report.httpStatus, 503);
    assert.equal(report.body.services.backend, 'offline');
    assert.equal(report.body.dependencies.mongodb, 'disconnected');
});

test('mongo failure outranks mcp failure', async () => {
    const report = await buildHealthReport({ mcpMounted: false, redis: noRedis, probeDatabase: dbDown });
    assert.equal(report.status, UNHEALTHY);
    assert.equal(report.httpStatus, 503);
});

test('message string is preserved for the EADDRINUSE probe and the render deploy gate', async () => {
    const report = await buildHealthReport({ mcpMounted: true, redis: noRedis, probeDatabase: dbUp });
    assert.equal(report.body.message, HEALTH_MESSAGE);
    assert.equal(report.body.message, 'UI-Hub Unified Backend & MCP Server is Live');
});

test('unconfigured redis is reported but never degrades health', async () => {
    const report = await buildHealthReport({ mcpMounted: true, redis: noRedis, probeDatabase: dbUp });
    assert.equal(report.status, HEALTHY);
    assert.equal(report.body.dependencies.redis.required, false);
    assert.equal(report.body.dependencies.redis.configured, false);
    assert.equal(report.body.dependencies.redis.connected, false);
});

test('connected redis is reported without changing status', async () => {
    const report = await buildHealthReport({ mcpMounted: true, redis: withRedis, probeDatabase: dbUp });
    assert.equal(report.status, HEALTHY);
    assert.equal(report.body.dependencies.redis.configured, true);
    assert.equal(report.body.dependencies.redis.connected, true);
});

test('a hanging database probe is bounded instead of blocking the endpoint', async () => {
    const never = () => new Promise(() => {});
    const started = Date.now();
    const report = await buildHealthReport({ mcpMounted: true, redis: noRedis, probeDatabase: never });
    assert.equal(report.status, UNHEALTHY);
    assert.ok(Date.now() - started < 5000, 'probe should be time-bounded');
});

test('a throwing database probe is reported as disconnected, not a 500', async () => {
    const throws = async () => {
        throw new Error('server selection timed out');
    };
    const report = await buildHealthReport({ mcpMounted: true, redis: noRedis, probeDatabase: throws });
    assert.equal(report.status, UNHEALTHY);
    assert.equal(report.httpStatus, 503);
});

test('health response never leaks a connection string or secret', async () => {
    const report = await buildHealthReport({ mcpMounted: true, redis: noRedis, probeDatabase: dbUp });
    const serialised = JSON.stringify(report.body);
    assert.ok(!serialised.includes('mongodb://'));
    assert.ok(!serialised.includes('mongodb+srv://'));
    assert.ok(!serialised.includes('password'));
});

test('httpStatusFor maps only unhealthy to 503', () => {
    assert.equal(httpStatusFor(HEALTHY), 200);
    assert.equal(httpStatusFor(DEGRADED), 200);
    assert.equal(httpStatusFor(UNHEALTHY), 503);
});

test('report carries a timestamp and env for operator debugging', async () => {
    const report = await buildHealthReport({ mcpMounted: true, redis: noRedis, probeDatabase: dbUp });
    assert.ok(!Number.isNaN(Date.parse(report.body.timestamp)));
    assert.equal(typeof report.body.env, 'string');
});
