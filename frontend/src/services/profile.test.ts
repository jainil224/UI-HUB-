import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/firebase', () => ({
    auth: { currentUser: { getIdToken: vi.fn(async () => 'test-token') } },
}));
vi.mock('../utils/apiConfig', () => ({ getApiBaseUrl: () => 'http://api.test' }));

import {
    ProfileError,
    getProfile,
    updateProfile,
    checkUsername,
    uploadAvatarToCloudinary,
    resizeImageToSquare,
    type AvatarSignature,
} from './profile';

const jsonResponse = (body: unknown, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => body,
});

describe('profile service', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('ProfileError carries a code and status', () => {
        const err = new ProfileError('nope', 'X', 409);
        expect(err).toBeInstanceOf(Error);
        expect(err.name).toBe('ProfileError');
        expect(err.code).toBe('X');
        expect(err.status).toBe(409);
    });

    it('getProfile GETs the profile with a bearer token', async () => {
        (fetch as any).mockResolvedValue(
            jsonResponse({
                success: true,
                profile: { username: 'ada' },
                cloudinary: { configured: true, maxBytes: 5242880 },
            })
        );
        const result = await getProfile();
        expect(result.profile.username).toBe('ada');
        expect(result.cloudinary.configured).toBe(true);

        const [url, init] = (fetch as any).mock.calls[0];
        expect(url).toBe('http://api.test/api/v1/users/profile');
        expect(init.headers.Authorization).toBe('Bearer test-token');
    });

    it('updateProfile PUTs the payload and returns the profile', async () => {
        (fetch as any).mockResolvedValue(jsonResponse({ success: true, profile: { displayName: 'Ada' } }));
        const profile = await updateProfile({ displayName: 'Ada' });
        expect(profile.displayName).toBe('Ada');

        const [url, init] = (fetch as any).mock.calls[0];
        expect(url).toBe('http://api.test/api/v1/users/profile');
        expect(init.method).toBe('PUT');
        expect(JSON.parse(init.body)).toEqual({ displayName: 'Ada' });
    });

    it('checkUsername URL-encodes the handle', async () => {
        (fetch as any).mockResolvedValue(jsonResponse({ success: true, available: false, reason: 'TAKEN' }));
        const result = await checkUsername('a b');
        expect(result).toEqual({ available: false, reason: 'TAKEN' });

        const [url] = (fetch as any).mock.calls[0];
        expect(url).toBe('http://api.test/api/v1/users/username-available?handle=a%20b');
    });

    it('maps a backend error code to ProfileError', async () => {
        (fetch as any).mockResolvedValue(
            jsonResponse(
                { success: false, code: 'USERNAME_TAKEN', error: 'That username is taken' },
                false,
                409
            )
        );
        await expect(updateProfile({ username: 'ada' })).rejects.toMatchObject({
            code: 'USERNAME_TAKEN',
            status: 409,
            message: 'That username is taken',
        });
    });

    it('maps an express-validator errors array to ProfileError', async () => {
        (fetch as any).mockResolvedValue(
            jsonResponse(
                { success: false, errors: [{ path: 'username', msg: 'bad handle' }] },
                false,
                400
            )
        );
        await expect(updateProfile({ username: 'x' })).rejects.toMatchObject({
            code: 'username',
            message: 'bad handle',
            status: 400,
        });
    });

    it('uploads to Cloudinary and resolves with the secure url + public id', async () => {
        class FakeFormData {
            entries: Array<[string, unknown]> = [];
            append(key: string, value: unknown) {
                this.entries.push([key, value]);
            }
        }
        class FakeXHR {
            static last: FakeXHR | null = null;
            method = '';
            url = '';
            status = 0;
            responseText = '';
            upload: { onprogress: ((e: unknown) => void) | null } = { onprogress: null };
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            body: FakeFormData | null = null;
            open(method: string, url: string) {
                this.method = method;
                this.url = url;
            }
            send(body: FakeFormData) {
                this.body = body;
                FakeXHR.last = this;
            }
        }
        vi.stubGlobal('FormData', FakeFormData);
        vi.stubGlobal('XMLHttpRequest', FakeXHR);

        const signature: AvatarSignature = {
            cloudName: 'demo-cloud',
            apiKey: 'api-key',
            timestamp: 123,
            signature: 'sig',
            folder: 'ui-hub/avatars',
            allowedFormats: ['jpg', 'png'],
            maxFileSize: 5 * 1024 * 1024,
        };
        const file = { name: 'a.png', type: 'image/png' } as unknown as File;

        const promise = uploadAvatarToCloudinary(file, signature);
        const xhr = FakeXHR.last!;
        expect(xhr.method).toBe('POST');
        expect(xhr.url).toBe('https://api.cloudinary.com/v1_1/demo-cloud/image/upload');
        expect(xhr.body!.entries.map(([k]) => k)).toEqual(
            expect.arrayContaining(['file', 'api_key', 'timestamp', 'signature', 'folder', 'allowed_formats'])
        );

        xhr.status = 200;
        xhr.responseText = JSON.stringify({
            secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/a.jpg',
            public_id: 'ui-hub/avatars/a',
        });
        xhr.onload!();

        await expect(promise).resolves.toEqual({
            url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/a.jpg',
            publicId: 'ui-hub/avatars/a',
        });
    });

    it('rejects with the Cloudinary error message on failure', async () => {
        class FakeXHR {
            static last: FakeXHR | null = null;
            status = 0;
            responseText = '';
            upload = { onprogress: null };
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            open() {}
            send() {
                FakeXHR.last = this;
            }
        }
        vi.stubGlobal('FormData', class {
            append() {}
        });
        vi.stubGlobal('XMLHttpRequest', FakeXHR);

        const signature: AvatarSignature = {
            cloudName: 'demo-cloud',
            apiKey: 'api-key',
            timestamp: 123,
            signature: 'sig',
            folder: 'ui-hub/avatars',
            allowedFormats: ['jpg'],
            maxFileSize: 1,
        };
        const promise = uploadAvatarToCloudinary({ name: 'a.png', type: 'image/png' } as unknown as File, signature);
        const xhr = FakeXHR.last!;
        xhr.status = 400;
        xhr.responseText = JSON.stringify({ error: { message: 'File too large' } });
        xhr.onload!();

        await expect(promise).rejects.toMatchObject({ code: 'UPLOAD_FAILED', status: 400, message: 'File too large' });
    });

    it('resizeImageToSquare rejects non-image files', async () => {
        const file = { name: 'notes.txt', type: 'text/plain' } as unknown as File;
        await expect(resizeImageToSquare(file)).rejects.toMatchObject({ code: 'NOT_AN_IMAGE' });
    });
});
