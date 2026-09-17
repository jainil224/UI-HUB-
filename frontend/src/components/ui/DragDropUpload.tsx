import React, { useCallback, useRef, useState } from 'react';
import { CloudUpload, File, X, AlertCircle } from 'lucide-react';

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    error?: string;
}

interface DragDropUploadProps {
    /** Called when files are added or removed (current in-memory list). */
    onFilesChange?: (files: UploadedFile[]) => void;
    /** Optional accepted MIME types / extensions (e.g. "image/*,.pdf"). */
    accept?: string;
    /** Allow multiple files. */
    multiple?: boolean;
    /** Per-file size limit in MB (0 = unlimited). */
    maxSizeMB?: number;
    /** Upload progress 0-100. When provided the orbit ring reflects it. */
    progress?: number;
    /** Show a simulated progress animation when files are added. */
    simulateProgress?: boolean;
    /** Headline text in the drop zone. */
    title?: string;
    /** Subtitle / helper text in the drop zone. */
    subtitle?: string;
    className?: string;
}

let idCounter = 0;
const nextId = () => `file-${++idCounter}-${Date.now()}`;

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / 1024 ** i;
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
    onFilesChange,
    accept,
    multiple = true,
    maxSizeMB = 0,
    progress: externalProgress,
    simulateProgress = true,
    title = 'Drag & drop files',
    subtitle = 'or browse from your device',
    className = '',
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [localProgress, setLocalProgress] = useState(0);
    const filesRef = useRef(files);
    filesRef.current = files;

    const progress = externalProgress !== undefined ? externalProgress : localProgress;

    const addFiles = useCallback(
        (list: FileList | File[]) => {
            const incoming: UploadedFile[] = Array.from(list).map((file) => {
                let error: string | undefined;
                if (maxSizeMB > 0 && file.size > maxSizeMB * 1024 * 1024) {
                    error = `> ${maxSizeMB}MB`;
                }
                return { id: nextId(), name: file.name, size: file.size, error };
            });

            const next = multiple ? [...filesRef.current, ...incoming] : incoming.slice(-1);
            setFiles(next);
            filesRef.current = next;
            onFilesChange?.(next);

            if (simulateProgress && externalProgress === undefined) {
                setLocalProgress(12);
                const timer = setInterval(() => {
                    setLocalProgress((p) => {
                        if (p >= 100) {
                            clearInterval(timer);
                            return 100;
                        }
                        return Math.min(100, p + 6 + Math.random() * 14);
                    });
                }, 180);
            }
        },
        [maxSizeMB, multiple, onFilesChange, simulateProgress, externalProgress],
    );

    const removeFile = useCallback(
        (id: string) => {
            const next = filesRef.current.filter((f) => f.id !== id);
            setFiles(next);
            filesRef.current = next;
            onFilesChange?.(next);
        },
        [onFilesChange],
    );

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        },
        [addFiles],
    );

    const R = 26; // ring radius
    const C = 2 * Math.PI * R;
    const filled = C * (Math.max(0, Math.min(100, progress)) / 100);

    return (
        <div className={`w-full ${className}`}>
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload files"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                }}
                onDrop={onDrop}
                className={`relative flex min-h-[190px] cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed p-8 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                    isDragging
                        ? 'border-brand-blue bg-brand-blue/5'
                        : 'border-neutral-700 bg-neutral-900/60 hover:border-neutral-500'
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files?.length) addFiles(e.target.files);
                        e.target.value = '';
                    }}
                />

                {/* Orbit progress ring around the cloud icon */}
                <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg
                        width="92"
                        height="92"
                        viewBox="0 0 92 92"
                        className="absolute -inset-1 -rotate-90"
                        aria-hidden
                    >
                        <circle cx="46" cy="46" r={R} fill="none" strokeWidth="2.5" className="stroke-neutral-800" />
                        <circle
                            cx="46"
                            cy="46"
                            r={R}
                            fill="none"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="stroke-brand-blue transition-[stroke-dashoffset] duration-300 ease-out"
                            strokeDasharray={C}
                            strokeDashoffset={C - filled}
                        />
                    </svg>
                    <CloudUpload size={30} className={isDragging ? 'text-brand-blue' : 'text-neutral-400'} />
                </div>

                <p className="text-sm font-medium text-neutral-200">{title}</p>
                <p className="text-xs text-neutral-500">{subtitle}</p>
                {progress > 0 && progress < 100 && (
                    <p className="font-mono text-[11px] text-brand-blue">{Math.round(progress)}%</p>
                )}
            </div>

            {/* File chip list */}
            {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                    {files.map((file) => (
                        <li
                            key={file.id}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
                                file.error
                                    ? 'border-red-500/40 bg-red-500/5'
                                    : 'border-white/10 bg-neutral-900'
                            }`}
                        >
                            <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                    file.error ? 'bg-red-500/15 text-red-400' : 'bg-brand-blue/15 text-brand-blue'
                                }`}
                            >
                                {file.error ? <AlertCircle size={14} /> : <File size={14} />}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-neutral-100">{file.name}</p>
                                <p className="text-[11px] text-neutral-500">
                                    {file.error ? file.error : formatSize(file.size)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(file.id);
                                }}
                                aria-label={`Remove ${file.name}`}
                                className="shrink-0 rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DragDropUpload;