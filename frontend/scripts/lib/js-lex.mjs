const QUOTE = 34;
const APOS = 39;
const BACKTICK = 96;
const SLASH = 47;
const STAR = 42;

function isIdentChar(code) {
    return (
        (code >= 97 && code <= 122) ||
        (code >= 65 && code <= 90) ||
        (code >= 48 && code <= 57) ||
        code === 36 ||
        code === 95
    );
}

function skipLineComment(src, i) {
    while (i < src.length && src.charCodeAt(i) !== 10) i += 1;
    return i;
}

function skipBlockComment(src, i) {
    i += 2;
    while (i < src.length) {
        if (src.charCodeAt(i) === STAR && src.charCodeAt(i + 1) === SLASH) return i + 2;
        i += 1;
    }
    return i;
}

function skipQuoted(src, i) {
    const quote = src.charCodeAt(i);
    i += 1;
    while (i < src.length) {
        const code = src.charCodeAt(i);
        if (code === 92) {
            i += 2;
            continue;
        }
        if (code === quote) return i + 1;
        i += 1;
    }
    return i;
}

function skipTemplate(src, i) {
    i += 1;
    while (i < src.length) {
        const code = src.charCodeAt(i);
        if (code === 92) {
            i += 2;
            continue;
        }
        if (code === BACKTICK) return i + 1;
        if (code === 36 && src.charCodeAt(i + 1) === 123) {
            i = skipBalanced(src, i + 1);
            continue;
        }
        i += 1;
    }
    return i;
}

function skipBalanced(src, i) {
    let depth = 0;
    while (i < src.length) {
        const code = src.charCodeAt(i);
        if (code === QUOTE || code === APOS) {
            i = skipQuoted(src, i);
            continue;
        }
        if (code === BACKTICK) {
            i = skipTemplate(src, i);
            continue;
        }
        if (code === SLASH && src.charCodeAt(i + 1) === STAR) {
            i = skipBlockComment(src, i);
            continue;
        }
        if (code === SLASH && src.charCodeAt(i + 1) === SLASH) {
            i = skipLineComment(src, i);
            continue;
        }
        if (code === 123 || code === 91 || code === 40) depth += 1;
        if (code === 125 || code === 93 || code === 41) {
            depth -= 1;
            if (depth === 0) return i + 1;
        }
        i += 1;
    }
    return i;
}

function nextMeaningful(src, i) {
    while (i < src.length) {
        const code = src.charCodeAt(i);
        if (code === SLASH && src.charCodeAt(i + 1) === STAR) {
            i = skipBlockComment(src, i);
            continue;
        }
        if (code === SLASH && src.charCodeAt(i + 1) === SLASH) {
            i = skipLineComment(src, i);
            continue;
        }
        if (!/\s/.test(src[i])) return i;
        i += 1;
    }
    return i;
}

export function findArrayStart(src, marker) {
    const markerIndex = src.indexOf(marker);
    if (markerIndex === -1) throw new Error(`Marker not found: ${marker}`);
    const bracket = src.indexOf('[', markerIndex + marker.length);
    if (bracket === -1) throw new Error(`Array bracket not found after: ${marker}`);
    return bracket;
}

export function scanArrayEntries(src, arrayStart) {
    const entries = [];
    let i = arrayStart + 1;
    let depth = 0;
    let entryStart = -1;

    while (i < src.length) {
        const code = src.charCodeAt(i);

        if (code === QUOTE || code === APOS) {
            i = skipQuoted(src, i);
            continue;
        }
        if (code === BACKTICK) {
            i = skipTemplate(src, i);
            continue;
        }
        if (code === SLASH && src.charCodeAt(i + 1) === STAR) {
            i = skipBlockComment(src, i);
            continue;
        }
        if (code === SLASH && src.charCodeAt(i + 1) === SLASH) {
            i = skipLineComment(src, i);
            continue;
        }
        if (code === 123) {
            if (depth === 0) entryStart = i;
            depth += 1;
            i += 1;
            continue;
        }
        if (code === 125) {
            depth -= 1;
            if (depth === 0 && entryStart !== -1) {
                entries.push({ start: entryStart, end: i + 1, text: src.slice(entryStart, i + 1) });
                entryStart = -1;
            }
            i += 1;
            continue;
        }
        if (code === 91 || code === 40) {
            depth += 1;
            i += 1;
            continue;
        }
        if (code === 93 || code === 41) {
            depth -= 1;
            i += 1;
            continue;
        }
        i += 1;
    }

    return entries;
}

export function scanObjectProps(objectText) {
    const props = new Map();
    let i = 1;
    const end = objectText.length - 1;

    while (i < end) {
        const code = objectText.charCodeAt(i);

        if (code === BACKTICK) {
            i = skipTemplate(objectText, i);
            continue;
        }
        if (code === SLASH && objectText.charCodeAt(i + 1) === STAR) {
            i = skipBlockComment(objectText, i);
            continue;
        }
        if (code === SLASH && objectText.charCodeAt(i + 1) === SLASH) {
            i = skipLineComment(objectText, i);
            continue;
        }
        if (!isIdentChar(code)) {
            if (code === QUOTE || code === APOS) {
                const keyEnd = skipQuoted(objectText, i);
                const quotedKey = unquote(objectText.slice(i, keyEnd));
                const afterQuotedKey = nextMeaningful(objectText, keyEnd);
                if (quotedKey && objectText[afterQuotedKey] === ':') {
                    const quotedRecord = readValue(
                        objectText,
                        nextMeaningful(objectText, afterQuotedKey + 1),
                        end,
                    );
                    props.set(quotedKey, quotedRecord.prop);
                    i = quotedRecord.next;
                    continue;
                }
                i = keyEnd;
                continue;
            }
            i += 1;
            continue;
        }

        let keyEnd = i;
        while (keyEnd < end && isIdentChar(objectText.charCodeAt(keyEnd))) keyEnd += 1;
        const key = objectText.slice(i, keyEnd);

        const afterKey = nextMeaningful(objectText, keyEnd);
        if (objectText[afterKey] !== ':') {
            i = keyEnd;
            continue;
        }

        const record = readValue(objectText, nextMeaningful(objectText, afterKey + 1), end);
        props.set(key, record.prop);
        i = record.next;
    }

    return props;
}

function readValue(objectText, valueStart, end) {
    const valueCode = objectText.charCodeAt(valueStart);

    if (valueCode === QUOTE || valueCode === APOS) {
        const valueEnd = skipQuoted(objectText, valueStart);
        return {
            prop: { kind: 'string', value: unquote(objectText.slice(valueStart, valueEnd)) },
            next: valueEnd,
        };
    }
    if (valueCode === BACKTICK) {
        const valueEnd = skipTemplate(objectText, valueStart);
        return {
            prop: { kind: 'complex', value: null, span: [valueStart, valueEnd] },
            next: valueEnd,
        };
    }
    if (objectText.startsWith('true', valueStart)) {
        return { prop: { kind: 'boolean', value: true }, next: valueStart + 4 };
    }
    if (objectText.startsWith('false', valueStart)) {
        return { prop: { kind: 'boolean', value: false }, next: valueStart + 5 };
    }
    if (valueCode === 123 || valueCode === 91 || valueCode === 40) {
        const valueEnd = skipBalanced(objectText, valueStart);
        return {
            prop: { kind: 'complex', value: null, span: [valueStart, valueEnd] },
            next: valueEnd,
        };
    }

    let tokenEnd = valueStart;
    while (tokenEnd < end && !/[,}\]\s]/.test(objectText[tokenEnd])) tokenEnd += 1;
    return {
        prop: { kind: 'literal', value: objectText.slice(valueStart, tokenEnd) },
        next: tokenEnd,
    };
}

export function collectStrings(objectText, prop) {
    if (!prop || prop.kind !== 'complex' || !prop.span) return [];
    const [start, end] = prop.span;
    const region = objectText.slice(start, end);
    const values = [];
    let i = 0;

    while (i < region.length) {
        const code = region.charCodeAt(i);
        if (code === QUOTE || code === APOS) {
            const stringEnd = skipQuoted(region, i);
            values.push(unquote(region.slice(i, stringEnd)));
            i = stringEnd;
            continue;
        }
        if (code === BACKTICK) {
            const stringEnd = skipTemplate(region, i);
            values.push(region.slice(i + 1, stringEnd - 1));
            i = stringEnd;
            continue;
        }
        i += 1;
    }

    return values;
}

export function unquote(raw) {
    if (raw.length < 2) return '';
    const body = raw.slice(1, -1);
    return body.replace(/\\(.)/g, '$1');
}

export function looseJsonParse(text) {
    const withoutTrailingCommas = text.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(withoutTrailingCommas);
}