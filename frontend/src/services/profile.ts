import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';

const BASE = getApiBaseUrl();

export interface ProfileData {
    uid: string | null;
    email: string | null;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    avatarPublicId: string | null;
    planTier: string;
    status: string;
    createdAt?: string | null;
    profileUpdatedAt?: string | null;
}

export interface CloudinaryStatus {
    configured: boolean;
    maxBytes: number;
}

export interface AvatarSignature {
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
    allowedFormats: string[];
    maxFileSize: number;
}

export interface UpdateProfileInput {
    displayName?: string;
    username?: string | null;
    avatarUrl?: string | null;
    avatarPublicId?: string | null;
}

export class ProfileError extends Error {
    code?: string;
    status?: number;
    constructor(message: string, code?: string, status?: number) {
        super(message);
        this.name = 'ProfileError';
        this.code = code;
        this.status = status;
    }
}

async function authHeaders(): Promise<Record<string, string>> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new ProfileError('You must be signed in.', 'NOT_AUTHENTICATED', 401);
    const idToken = await currentUser.getIdToken();
    return {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
    };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: { ...(await authHeaders()), ...(init?.headers || {}) },
    });
    if (!res.ok) {
        let message = `Request failed: ${res.status}`;
        let code: string | undefined;
        try {
            const data = await res.json();
            if (data?.error) message = data.error;
            if (data?.message) message = data.message;
            if (data?.code) code = data.code;
            // express-validator shape: { success:false, errors:[{ path, msg }] }
            if (Array.isArray(data?.errors) && data.errors.length > 0) {
                code = code || data.errors[0]?.path;
                message = data.errors[0]?.msg || message;
            }
        } catch {
            // ignore body parse errors
        }
        throw new ProfileError(message, code, res.status);
    }
    return res.json() as Promise<T>;
}

export const getProfile = async (): Promise<{ profile: ProfileData; cloudinary: CloudinaryStatus }> => {
    const data = await request<{ success: boolean; profile: ProfileData; cloudinary: CloudinaryStatus }>(
        '/api/v1/users/profile'
    );
    return { profile: data.profile, cloudinary: data.cloudinary };
};

export const updateProfile = async (updates: UpdateProfileInput): Promise<ProfileData> => {
    const data = await request<{ success: boolean; profile: ProfileData }>('/api/v1/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    return data.profile;
};

export const checkUsername = async (
    handle: string,
    signal?: AbortSignal
): Promise<{ available: boolean; reason?: string }> => {
    const data = await request<{ success: boolean; available: boolean; reason?: string }>(
        `/api/v1/users/username-available?handle=${encodeURIComponent(handle)}`,
        { signal }
    );
    return { available: data.available, reason: data.reason };
};

export const checkDisplayName = async (
    name: string,
    signal?: AbortSignal
): Promise<{ available: boolean; reason?: string }> => {
    const data = await request<{ success: boolean; available: boolean; reason?: string }>(
        `/api/v1/users/display-name-available?name=${encodeURIComponent(name)}`,
        { signal }
    );
    return { available: data.available, reason: data.reason };
};

export const requestAvatarSignature = async (): Promise<AvatarSignature> => {
    const data = await request<{ success: boolean } & AvatarSignature>('/api/v1/users/avatar-signature', {
        method: 'POST',
    });
    const { success, ...signature } = data;
    return signature as AvatarSignature;
};

export const deleteAvatar = async (): Promise<ProfileData> => {
    const data = await request<{ success: boolean; profile: ProfileData }>('/api/v1/users/avatar', {
        method: 'DELETE',
    });
    return data.profile;
};

/**
 * Uploads a file straight to Cloudinary using a signature minted by the
 * backend. The API secret never reaches the browser; image bytes never pass
 * through our Express server.
 */
export const uploadAvatarToCloudinary = (
    file: File,
    signature: AvatarSignature,
    onProgress?: (percent: number) => void
): Promise<{ url: string; publicId: string }> =>
    new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('file', file);
        form.append('api_key', signature.apiKey);
        form.append('timestamp', String(signature.timestamp));
        form.append('signature', signature.signature);
        form.append('folder', signature.folder);
        form.append('allowed_formats', signature.allowedFormats.join(','));

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`);

        xhr.upload.onprogress = (event) => {
            if (onProgress && event.lengthComputable) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        xhr.onload = () => {
            let payload: any = {};
            try {
                payload = JSON.parse(xhr.responseText);
            } catch {
                // fall through to the status check
            }
            if (xhr.status >= 200 && xhr.status < 300 && payload?.secure_url) {
                resolve({ url: payload.secure_url, publicId: payload.public_id });
            } else {
                reject(
                    new ProfileError(
                        payload?.error?.message || `Upload failed (${xhr.status})`,
                        'UPLOAD_FAILED',
                        xhr.status
                    )
                );
            }
        };
        xhr.onerror = () => reject(new ProfileError('Network error during upload', 'UPLOAD_NETWORK'));
        xhr.send(form);
    });

/**
 * Center-crops and downscales an image to a square, returning a new File.
 * Keeps avatars small and consistent while avoiding any extra dependency.
 */
export const resizeImageToSquare = async (file: File, size = 512): Promise<File> => {
    if (!file.type.startsWith('image/')) {
        throw new ProfileError('Please choose an image file.', 'NOT_AN_IMAGE');
    }

    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) {
        // Browsers without createImageBitmap fall back to the original file.
        return file;
    }

    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
    );
    if (!blob) return file;

    const baseName = (file.name || 'avatar').replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
};

/** Loads an image (blob/data URL) into an HTMLImageElement. */
const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new ProfileError('Could not read the image.', 'CROP_FAILED'));
        img.src = src;
    });

/**
 * Crops the selected region of an image and downscales it to a square JPEG.
 * `area` is the pixel region reported by the crop UI.
 */
export const cropImageToSquare = async (
    imageSrc: string,
    area: { x: number; y: number; width: number; height: number },
    size = 512
): Promise<File> => {
    const image = await loadImage(imageSrc);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new ProfileError('Could not process the image.', 'CROP_FAILED');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
    );
    if (!blob) throw new ProfileError('Could not process the image.', 'CROP_FAILED');

    return new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
};
