import React, { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Loader2, X } from 'lucide-react';

interface ImageCropModalProps {
    imageSrc: string;
    busy?: boolean;
    onCancel: () => void;
    onConfirm: (area: Area) => void | Promise<void>;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageSrc, busy = false, onCancel, onConfirm }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState<Area | null>(null);

    const handleCropComplete = useCallback((_cropped: Area, croppedAreaPixels: Area) => {
        setArea(croppedAreaPixels);
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !busy) onCancel();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [busy, onCancel]);

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Crop profile photo"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !busy) onCancel();
            }}
        >
            <div className="w-full max-w-md overflow-hidden rounded-xl border-2 border-white bg-brand-surface brutal-shadow-blue">
                <header className="flex items-center justify-between border-b-2 border-white/10 px-5 py-3">
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">Crop photo</h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        aria-label="Close crop dialog"
                        className="rounded-md p-1 text-white/50 transition hover:text-white disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="relative h-[min(60vh,340px)] w-full bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        objectFit="contain"
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] font-semibold text-white/60">
                        Drag to reposition · scroll or use the slider to zoom
                    </div>
                </div>

                <div className="space-y-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/40">Zoom</span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            aria-label="Zoom"
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#1F4BFF]"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={busy}
                            className="rounded-md border-2 border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/60 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => area && onConfirm(area)}
                            disabled={busy || !area}
                            className="flex items-center gap-2 rounded-md border-2 border-white bg-[#1F4BFF] px-5 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#2855FF] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {busy && <Loader2 size={13} className="animate-spin" />}
                            Use photo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
