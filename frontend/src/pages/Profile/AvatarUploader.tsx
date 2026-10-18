import React, { useRef, useState } from 'react';
import { Camera, Loader2, Trash2, AlertCircle, User as UserIcon } from 'lucide-react';
import {
    requestAvatarSignature,
    uploadAvatarToCloudinary,
    resizeImageToSquare,
    ProfileError,
} from '../../services/profile';

interface AvatarUploaderProps {
    avatarUrl: string | null;
    name: string;
    isPro: boolean;
    cloudinaryConfigured: boolean;
    maxBytes: number;
    disabled?: boolean;
    onUploaded: (url: string, publicId: string) => Promise<void> | void;
    onRemoved: () => Promise<void> | void;
}

const MAX_DISPLAY_MB = (bytes: number) => Math.max(1, Math.round(bytes / (1024 * 1024)));

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
    avatarUrl,
    name,
    isPro,
    cloudinaryConfigured,
    maxBytes,
    disabled = false,
    onUploaded,
    onRemoved,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const ring = isPro
        ? 'border-[#FFC700] shadow-[0_0_18px_rgba(255,199,0,0.45)]'
        : 'border-[#1F4BFF] shadow-[0_0_18px_rgba(31,75,255,0.45)]';

    const pickFile = () => {
        if (disabled || busy) return;
        inputRef.current?.click();
    };

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setError(null);

        if (!cloudinaryConfigured) {
            setError('Image uploads are not configured yet. Add Cloudinary keys on the server.');
            return;
        }
        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file (JPG, PNG or WebP).');
            return;
        }
        if (file.size > maxBytes) {
            setError(`Image is too large. Maximum size is ${MAX_DISPLAY_MB(maxBytes)} MB.`);
            return;
        }

        setBusy(true);
        setProgress(0);
        try {
            const optimized = await resizeImageToSquare(file, 512);
            const signature = await requestAvatarSignature();
            const { url, publicId } = await uploadAvatarToCloudinary(optimized, signature, setProgress);
            await onUploaded(url, publicId);
        } catch (err) {
            setError(err instanceof ProfileError ? err.message : 'Upload failed. Please try again.');
        } finally {
            setBusy(false);
            setProgress(0);
        }
    };

    const handleRemove = async () => {
        if (disabled || busy) return;
        setError(null);
        setBusy(true);
        try {
            await onRemoved();
        } catch (err) {
            setError(err instanceof ProfileError ? err.message : 'Could not remove the image.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
                <div className={`relative h-28 w-28 overflow-hidden rounded-full border-2 ${ring}`}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name || 'Profile'} className="h-full w-full object-cover" />
                    ) : (
                        <div
                            className={`flex h-full w-full items-center justify-center ${
                                isPro ? 'bg-[#FFC700] text-black' : 'bg-[#1F4BFF] text-white'
                            }`}
                        >
                            <UserIcon size={40} />
                        </div>
                    )}
                    {busy && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <span className="text-sm font-black text-white">{progress || 0}%</span>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={pickFile}
                    disabled={disabled || busy}
                    aria-label="Change photo"
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-black bg-[#1F4BFF] text-white transition hover:bg-[#2855FF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFile}
                />
            </div>

            <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-black uppercase tracking-wider text-white/90">Profile photo</p>
                <p className="mt-1 text-xs text-white/40">
                    {cloudinaryConfigured
                        ? `JPG, PNG or WebP. Up to ${MAX_DISPLAY_MB(maxBytes)} MB. Square crop applied automatically.`
                        : 'Uploads are disabled until Cloudinary is configured on the server.'}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <button
                        type="button"
                        onClick={pickFile}
                        disabled={disabled || busy || !cloudinaryConfigured}
                        className="rounded-md border-2 border-white/20 bg-white/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/80 transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {avatarUrl ? 'Change photo' : 'Upload photo'}
                    </button>
                    {avatarUrl && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={disabled || busy}
                            className="flex items-center gap-1.5 rounded-md border-2 border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Trash2 size={12} /> Remove
                        </button>
                    )}
                </div>

                {error && (
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-300 sm:justify-start">
                        <AlertCircle size={13} /> {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AvatarUploader;
