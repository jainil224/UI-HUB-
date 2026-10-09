import { sanitizeText } from './redaction.js';
import { classifyFailure } from './failureClassifier.js';
export function extractClientInfo(params) {
    const ci = params?.clientInfo;
    return {
        name: typeof ci?.name === 'string' ? sanitizeText(ci.name, 80) : undefined,
        version: typeof ci?.version === 'string' ? sanitizeText(ci.version, 40) : undefined,
    };
}
/** Best-effort extraction of the primary resource id referenced by a tool call. */
export function extractResourceId(toolName, args) {
    if (!toolName || !args || typeof args !== 'object')
        return undefined;
    const candidate = args.componentId ?? args.templateId ?? args.animationId ?? args.id ?? args.resourceId;
    if (typeof candidate === 'string' && candidate.length > 0)
        return sanitizeText(candidate, 120);
    return undefined;
}
export function extractFilters(args) {
    if (!args || typeof args !== 'object')
        return undefined;
    const filters = {};
    for (const key of ['category', 'isPremium', 'tags', 'author', 'behavior', 'type', 'limit']) {
        if (args[key] !== undefined)
            filters[key] = args[key];
    }
    return Object.keys(filters).length > 0 ? filters : undefined;
}
/** Parse the textual JSON payload of an MCP tool result for outcome signals. */
export function parseToolResult(result) {
    const out = { isError: false, zeroResults: false };
    if (!result || typeof result !== 'object')
        return out;
    out.isError = result.isError === true;
    let parsed;
    try {
        const text = result?.content?.[0]?.text;
        if (typeof text === 'string')
            parsed = JSON.parse(text);
    }
    catch {
        /* not JSON — leave parsed undefined */
    }
    if (!parsed || typeof parsed !== 'object')
        return out;
    if (typeof parsed.error === 'string')
        out.errorCode = parsed.error;
    if (typeof parsed.message === 'string')
        out.errorMessage = parsed.message;
    if (typeof parsed.count === 'number')
        out.resultCount = parsed.count;
    else if (Array.isArray(parsed.components))
        out.resultCount = parsed.components.length;
    else if (Array.isArray(parsed.templates))
        out.resultCount = parsed.templates.length;
    else if (Array.isArray(parsed.animations))
        out.resultCount = parsed.animations.length;
    else if (Array.isArray(parsed.results))
        out.resultCount = parsed.results.length;
    const ids = [];
    const collect = (arr) => {
        if (Array.isArray(arr)) {
            for (const item of arr.slice(0, 20)) {
                const v = item?.id ?? item?.componentId;
                if (typeof v === 'string' && v)
                    ids.push(v);
            }
        }
    };
    collect(parsed.components);
    collect(parsed.templates);
    collect(parsed.animations);
    collect(parsed.results);
    if (ids.length === 0) {
        const single = parsed.id ?? parsed.componentId;
        if (typeof single === 'string' && single)
            ids.push(single);
    }
    if (ids.length > 0)
        out.returnedIds = ids;
    if (out.resultCount === 0)
        out.zeroResults = true;
    return out;
}
/** Derive the failure category for a tool outcome (or undefined if successful). */
export function categoryForOutcome(parsed) {
    if (!parsed.isError && !parsed.zeroResults)
        return undefined;
    return classifyFailure({
        errorCode: parsed.errorCode,
        message: parsed.errorMessage,
        zeroResults: parsed.zeroResults,
    });
}
//# sourceMappingURL=mcpInstrumentation.js.map