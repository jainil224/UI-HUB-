import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Copy, FileCode2, FileImage, FolderOpen, Loader2 } from 'lucide-react';
import { TEMPLATE_SOURCE_CODE } from '../../data/templateSourceCode';
import {
    TEMPLATE_PUBLIC_ASSETS,
    TEMPLATE_SOURCE_FILES,
    TemplatePublicAsset,
} from './registry';
import {
    CodeLanguage,
    HighlightedLine,
    getFileFormat,
    highlightToTokenLines,
    isImageFile,
    languageForFile,
} from '../../utils/codeHighlighter';
import type { CopyNotification, CopyItemKind } from '../ui/Toast';

/**
 * VS Code-style source viewer for the template detail page.
 *
 * Two things shape the implementation:
 *
 * 1. Colour accuracy - highlighting runs through shiki's `dark-plus` theme,
 *    which is VS Code's own default dark theme, so the colours are the real
 *    ones rather than a hand-tuned imitation.
 *
 * 2. File size - `OriginkitHero24.tsx` is 1553 lines / 63 KB, so rendering a
 *    row per line eagerly would put tens of thousands of nodes in the DOM once
 *    tokens are split. The file is therefore highlighted exactly once into
 *    token arrays, and only the visible slice (plus overscan) is mounted.
 *    Spacer rows above and below preserve the true scroll height.
 *
 * The file tree shows the real path of the component that builds the template
 * plus only the public assets that template genuinely loads.
 */

/** Row height in px. Must match the inline lineHeight below for spacer maths. */
const LINE_HEIGHT = 20;
/** Extra lines rendered above and below the viewport to hide scroll seams. */
const OVERSCAN = 12;

/** Fraction of a file shown before "View full code" is pressed. */
const INITIAL_REVEAL_RATIO = 0.3;

/** Folder path of the template components, relative to the repo root. */
const SOURCE_TREE_PATH = ['frontend', 'src', 'components', 'templates'];

interface TemplateCodeViewerProps {
    /** Template whose source should be shown. */
    templateId: string;
    /** Human-readable template title, used in the tree header. */
    title: string;
    /**
     * True when the surrounding panel is fixed to the viewport. The root needs
     * a definite height either way: without one the scroll container grows to
     * fit all ~1600 rows and the windowing below is defeated.
     */
    isFullscreen?: boolean;
    /** Catalog surface this viewer belongs to, used by the copy notification. */
    notificationKind?: CopyItemKind;
    /** Preview shown in the copy notification when code is copied. */
    previewImage?: string;
    /** Animated preview shown in the copy notification when no image is set. */
    previewVideo?: string;
    /** Called after a successful copy so the page can raise its own rich toast. */
    onNotify?: (notification: CopyNotification) => void;
}

type Selection =
    | { kind: 'source' }
    | { kind: 'asset'; asset: TemplatePublicAsset; name: string };

const TemplateCodeViewer: React.FC<TemplateCodeViewerProps> = ({
    templateId,
    title,
    isFullscreen = false,
    notificationKind = 'template',
    previewImage,
    previewVideo,
    onNotify,
}) => {
    const sourceFileName = useMemo(
        () => TEMPLATE_SOURCE_FILES[templateId] || `${templateId}.tsx`,
        [templateId],
    );
    const sourceCode = useMemo(() => TEMPLATE_SOURCE_CODE[templateId] || '', [templateId]);
    const assets = useMemo(() => TEMPLATE_PUBLIC_ASSETS[templateId] || [], [templateId]);

    const [selection, setSelection] = useState<Selection>({ kind: 'source' });
    const [lines, setLines] = useState<HighlightedLine[] | null>(null);
    const [revealedCount, setRevealedCount] = useState<number | null>(null);
    const [assetText, setAssetText] = useState<string | null>(null);
    const [assetError, setAssetError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeLine, setActiveLine] = useState<number | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const [range, setRange] = useState({ start: 0, end: 40 });
    const frameRef = useRef<number | null>(null);

    const fileName = selection.kind === 'source' ? sourceFileName : selection.name;
    const format = getFileFormat(fileName);

    // Selecting a different file resets scroll, current line and reveal.
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
        setRange({ start: 0, end: 40 });
        setActiveLine(null);
        setRevealedCount(null);
    }, [selection]);

    // The Code tab can open with the panel below the fold - on a phone the file
    // tree used to push it almost entirely off-screen, which is why the wheel
    // scrolled the page instead of the code. `nearest` is a no-op on desktop.
    useEffect(() => {
        rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, []);

    // Highlight the selected file, or fetch the text of a text asset.
    useEffect(() => {
        let cancelled = false;

        if (selection.kind === 'source') {
            setLines(null);
            if (!sourceCode) {
                setLines([]);
                return;
            }
            const language: CodeLanguage = languageForFile(sourceFileName) || 'tsx';
            void highlightToTokenLines(sourceCode, language).then((result) => {
                if (!cancelled) setLines(result);
            });
            return () => {
                cancelled = true;
            };
        }

        // Images have no text to colour; the viewer shows them as a picture.
        if (isImageFile(selection.name)) {
            setAssetText(null);
            setAssetError(null);
            return;
        }

        setLines(null);
        setAssetError(null);
        void fetch(selection.asset.src)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            })
            .then((text) => {
                if (cancelled) return;
                setAssetText(text);
                return highlightToTokenLines(text, languageForFile(selection.name) || 'xml');
            })
            .then((result) => {
                if (!cancelled && result) setLines(result);
            })
            .catch((error: Error) => {
                if (!cancelled) setAssetError(error.message);
            });

        return () => {
            cancelled = true;
        };
    }, [selection, sourceCode, sourceFileName]);

    // How much of the file is currently revealed. Small text assets are never
    // truncated - only a file long enough to be worth deferring gets the gate.
    const total = lines?.length ?? 0;
    const initialReveal = useMemo(() => {
        const first = Math.ceil(total * INITIAL_REVEAL_RATIO);
        // Below this size the whole file is cheap to show, so do not gate it.
        return total > 400 ? first : total;
    }, [total]);
    const revealed = revealedCount ?? initialReveal;
    const isTruncated = total > 0 && revealed < total;
    const shownLines = useMemo(
        () => (lines ? lines.slice(0, revealed) : []),
        [lines, revealed],
    );
    const hiddenCount = Math.max(0, total - revealed);

    const revealAll = useCallback(() => {
        // Explicitly set to the full length: `null` means "use the 30% default".
        setRevealedCount(total);
        // The window was sized for a truncated file; grow it to the new height.
        const el = scrollRef.current;
        if (el) {
            const start = Math.max(0, Math.floor(el.scrollTop / LINE_HEIGHT) - OVERSCAN);
            const visible = Math.ceil(el.clientHeight / LINE_HEIGHT) + OVERSCAN * 2;
            setRange({ start, end: Math.min(total, start + visible) });
        }
    }, [total]);

    const hideCode = useCallback(() => {
        setRevealedCount(null);
        const el = scrollRef.current;
        if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
        const visible = Math.ceil((el?.clientHeight ?? 800) / LINE_HEIGHT) + OVERSCAN * 2;
        setRange({ start: 0, end: Math.min(initialReveal, visible) });
    }, [initialReveal]);

    // Windowed rendering: recompute the visible slice on scroll, throttled to
    // one update per animation frame so fast scrolling stays cheap.
    const handleScroll = useCallback(() => {
        if (frameRef.current !== null) return;
        frameRef.current = window.requestAnimationFrame(() => {
            frameRef.current = null;
            const el = scrollRef.current;
            if (!el || !shownLines.length) return;
            const start = Math.max(0, Math.floor(el.scrollTop / LINE_HEIGHT) - OVERSCAN);
            const visible = Math.ceil(el.clientHeight / LINE_HEIGHT) + OVERSCAN * 2;
            const end = Math.min(shownLines.length, start + visible);
            setRange((previous) =>
                previous.start === start && previous.end === end ? previous : { start, end },
            );
        });
    }, [shownLines.length]);

    useEffect(
        () => () => {
            if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
        },
        [],
    );

    // Grow the window when the viewport is taller than the initial estimate.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const update = () => {
            const start = Math.max(0, Math.floor(el.scrollTop / LINE_HEIGHT) - OVERSCAN);
            const visible = Math.ceil(el.clientHeight / LINE_HEIGHT) + OVERSCAN * 2;
            setRange({ start, end: Math.min(shownLines.length, start + visible) });
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, [shownLines.length]);

    const copyCurrentFile = useCallback(() => {
        if (selection.kind === 'source') {
            void navigator.clipboard.writeText(sourceCode);
        } else if (assetText) {
            void navigator.clipboard.writeText(assetText);
        } else {
            return;
        }
        setCopied(true);
        onNotify?.({
            itemTitle: title,
            itemKind: notificationKind,
            copiedType: 'code',
            copiedFileName: fileName,
            previewImage,
            previewVideo,
        });
        window.setTimeout(() => setCopied(false), 1600);
    }, [selection, sourceCode, assetText, fileName, title, notificationKind, previewImage, previewVideo, onNotify]);

    // VS Code moves the current-line highlight with the arrow keys.
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            setActiveLine((previous) => {
                const base = previous ?? (event.key === 'ArrowDown' ? 0 : (total || 1) - 1);
                return Math.min(Math.max(0, base), (total || 1) - 1);
            });
        },
        [total],
    );

    const start = range.start;
    const end = range.end;
    const rows = shownLines.slice(start, end);
    const isLoading = lines === null;

    const groupedAssets = useMemo(() => {
        const groups = new Map<string, TemplatePublicAsset[]>();
        for (const asset of assets) {
            const existing = groups.get(asset.folder);
            if (existing) existing.push(asset);
            else groups.set(asset.folder, [asset]);
        }
        return Array.from(groups.entries());
    }, [assets]);

    const renderTreeFile = (
        name: string,
        depth: number,
        isActive: boolean,
        onSelect: () => void,
    ) => {
        const fileFormat = getFileFormat(name);
        const Icon = isImageFile(name) ? FileImage : FileCode2;
        return (
            <button
                type="button"
                onClick={onSelect}
                data-file-name={name}
                aria-current={isActive ? 'true' : undefined}
                className={`flex w-full items-center gap-2 py-1.5 pr-2 text-left font-mono text-[11px] font-bold tracking-wide transition-colors ${isActive ? 'bg-[#3D5CFF] text-white shadow-[inset_3px_0px_0px_0px_#FFC700]' : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                style={{ paddingLeft: `${8 + depth * 12}px` }}
            >
                <Icon size={14} className={`shrink-0 !text-[#FFC700] ${fileFormat.iconClass}`} />
                <span className="truncate">{name}</span>
                <span
                    className={`ml-auto shrink-0 !rounded-none !border-2 !border-black !bg-white !px-1 !py-px !font-mono !text-[8px] !font-black !uppercase !tracking-wider !text-black ${fileFormat.badgeClass}`}
                >
                    {fileFormat.label}
                </span>
            </button>
        );
    };

    return (
        // On small screens the rows stack and the tree is pinned to 180px so it
        // cannot starve the code box. The class is literal because Tailwind's
        // scanner cannot see an interpolated class name.
        <div
            ref={rootRef}
            className={`grid min-h-0 grid-cols-[minmax(170px,240px)_minmax(0,1fr)] bg-[#0B0B0D] max-sm:h-[75dvh] max-sm:grid-cols-1 max-sm:grid-rows-[180px_minmax(0,1fr)] ${isFullscreen ? 'h-full flex-1' : 'h-[65vh]'
                }`}
        >
            {/* ── File tree ── */}
            <aside className="min-w-0 overflow-y-auto overscroll-y-contain border-r-2 border-black bg-[#141414] py-3 text-sm max-sm:border-r-0 max-sm:border-b-2">
                <div className="flex items-center gap-2 border-b-2 border-neutral-900 px-3 pb-3 font-mono text-[10px] font-black uppercase tracking-widest text-white">
                    <FolderOpen size={15} className="shrink-0 text-[#FFC700]" />
                    <span className="truncate">{title}</span>
                </div>

                <div className="space-y-0.5">
                    {SOURCE_TREE_PATH.map((segment, index) => (
                        <div
                            key={segment}
                            className="flex items-center gap-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500"
                            style={{ paddingLeft: `${8 + index * 12}px` }}
                        >
                            <FolderOpen size={14} className="shrink-0 text-[#FFC700]" />
                            <span className="truncate">{segment}</span>
                        </div>
                    ))}
                    {renderTreeFile(
                        sourceFileName,
                        SOURCE_TREE_PATH.length,
                        selection.kind === 'source',
                        () => setSelection({ kind: 'source' }),
                    )}

                    {groupedAssets.map(([folder, folderAssets]) => (
                        <React.Fragment key={folder}>
                            <div
                                className="mt-2 flex items-center gap-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500"
                                style={{ paddingLeft: '8px' }}
                            >
                                <FolderOpen size={14} className="shrink-0 text-[#FFC700]" />
                                <span className="truncate">public</span>
                            </div>
                            {folder
                                .split('/')
                                .map((segment, index) => (
                                    <div
                                        key={segment}
                                        className="flex items-center gap-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500"
                                        style={{ paddingLeft: `${8 + (index + 1) * 12}px` }}
                                    >
                                        <FolderOpen size={14} className="shrink-0 text-[#FFC700]" />
                                        <span className="truncate">{segment}</span>
                                    </div>
                                ))}
                            {folderAssets.map((asset) => {
                                const name = asset.src.split('/').pop() || asset.src;
                                return renderTreeFile(
                                    name,
                                    folder.split('/').length + 1,
                                    selection.kind === 'asset' && selection.asset.src === asset.src,
                                    () => setSelection({ kind: 'asset', asset, name }),
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </aside>

            {/* ── Editor ── */}
            <div className="flex min-w-0 flex-col overflow-hidden bg-[#0B0B0D]">
                <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b-2 border-black bg-[#141414] px-3">
                    <span className="flex min-w-0 items-center gap-2 font-mono text-[11px] font-bold text-neutral-100">
                        {isImageFile(fileName) ? (
                            <FileImage size={14} className={`!text-[#FFC700] ${format.iconClass}`} />
                        ) : (
                            <FileCode2 size={14} className={`!text-[#FFC700] ${format.iconClass}`} />
                        )}
                        <span className="truncate">{fileName}</span>
                        <span
                            className={`shrink-0 !rounded-none !border-2 !border-black !bg-white !px-1.5 !py-px !font-mono !text-[8px] !font-black !uppercase !tracking-wider !text-black ${format.badgeClass}`}
                        >
                            {format.label}
                        </span>
                        <span className="hidden shrink-0 font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-500 sm:inline">
                            {total > 0
                                ? isTruncated
                                    ? `${revealed} of ${total} lines`
                                    : `${total} lines`
                                : ''}
                        </span>
                    </span>
                    <button
                        type="button"
                        onClick={copyCurrentFile}
                        disabled={!sourceCode && !assetText}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border-2 border-black bg-[#1C1C1C] px-2.5 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_#000000] transition-colors hover:bg-[#3D5CFF] disabled:opacity-40"
                    >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>

                {assetError ? (
                    <div className="flex flex-1 items-center justify-center bg-[#0B0B0D] p-6 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Could not load {fileName} ({assetError})
                    </div>
                ) : selection.kind === 'asset' && isImageFile(fileName) ? (
                    <div className="flex flex-1 items-center justify-center overflow-auto bg-[#0B0B0D] p-6">
                        <img
                            src={selection.asset.src}
                            alt={fileName}
                            decoding="async"
                            className="max-h-[60vh] max-w-full object-contain"
                        />
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-1 items-center justify-center gap-2 bg-[#0B0B0D] p-6 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        <Loader2 size={14} className="animate-spin text-[#FFC700]" />
                        Loading highlighter…
                    </div>
                ) : total === 0 ? (
                    <div className="flex flex-1 items-center justify-center bg-[#0B0B0D] p-6 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        No source available for {sourceFileName}
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                        role="region"
                        aria-label={`Source of ${fileName}`}
                        className="min-h-0 flex-1 overflow-auto overscroll-y-contain bg-[#0B0B0D] py-2 font-mono text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3D5CFF]"
                    >
                        <div style={{ height: `${start * LINE_HEIGHT}px` }} aria-hidden="true" />
                        {rows.map((lineTokens, rowIndex) => {
                            const lineNumber = start + rowIndex;
                            const isActive = activeLine === lineNumber;
                            return (
                                <div
                                    key={lineNumber}
                                    onMouseEnter={() => setActiveLine(lineNumber)}
                                    className="flex min-w-max pr-6"
                                    style={{
                                        height: `${LINE_HEIGHT}px`,
                                        lineHeight: `${LINE_HEIGHT}px`,
                                        backgroundColor: isActive ? '#13204D' : undefined,
                                    }}
                                >
                                    <span className="sticky left-0 z-10 w-12 shrink-0 select-none border-r border-neutral-900 bg-[#0B0B0D] pr-3 text-right text-neutral-600">
                                        {lineNumber + 1}
                                    </span>
                                    <span className="whitespace-pre">
                                        {lineTokens.length === 0 ? (
                                            ' '
                                        ) : (
                                            lineTokens.map((token, tokenIndex) => (
                                                <span
                                                    key={tokenIndex}
                                                    style={{
                                                        color: token.color,
                                                        fontStyle: token.fontStyle,
                                                    }}
                                                >
                                                    {token.content}
                                                </span>
                                            ))
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                        {isTruncated && end >= shownLines.length && (
                            <div className="sticky bottom-0 z-20 border-y-2 border-black bg-[#141414] px-4 py-3 shadow-[0_-3px_0px_0px_#000000]">
                                <button
                                    type="button"
                                    onClick={revealAll}
                                    data-testid="view-full-code"
                                    aria-label={`View full code, ${hiddenCount} more lines`}
                                    className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-black bg-[#FFC700] px-4 py-2 font-mono text-[11px] font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000000] transition-colors hover:bg-white"
                                >
                                    <ChevronDown size={14} />
                                    View full code
                                    <span className="text-black/60">
                                        (+{hiddenCount.toLocaleString()} more lines)
                                    </span>
                                </button>
                            </div>
                        )}
                        {total > 400 && revealedCount !== null && !isTruncated && end >= shownLines.length && (
                            <div className="sticky bottom-0 z-20 border-y-2 border-black bg-[#141414] px-4 py-3 shadow-[0_-3px_0px_0px_#000000]">
                                <button
                                    type="button"
                                    onClick={hideCode}
                                    data-testid="hide-full-code"
                                    className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-black bg-[#3D5CFF] px-4 py-2 font-mono text-[11px] font-black uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_#000000] transition-colors hover:bg-[#2540D6]"
                                >
                                    <ChevronUp size={14} />
                                    Hide code
                                </button>
                            </div>
                        )}
                        {/* Spacer covers only the revealed slice, so a truncated
                            file does not scroll into content it is not showing. */}
                        <div
                            style={{
                                height: `${Math.max(0, shownLines.length - end) * LINE_HEIGHT}px`,
                            }}
                            aria-hidden="true"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateCodeViewer;
