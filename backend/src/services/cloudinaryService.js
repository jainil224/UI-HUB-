import crypto from 'node:crypto';
import dotenv from 'dotenv';

// Load env here (like mongoService) so credentials are available regardless of
// module import order — ESM evaluates imports before server.js runs dotenv.
dotenv.config();

/**
 * Cloudinary integration for user avatars (dependency-free).
 *
 * The browser never holds the API secret. Instead:
 *   1. `POST /api/v1/users/avatar-signature` returns a short-lived signature
 *      (plus cloud name + public API key) produced here.
 *   2. The browser POSTs the file directly to Cloudinary's upload endpoint
 *      with that signature, so image bytes never touch this Express server
 *      (whose JSON body limit is 2mb and would reject large photos anyway).
 *   3. Only the resolved `secure_url` + `public_id` are persisted on the user.
 *
 * Signing is a plain sha1 over alphabetically-sorted params + the API secret,
 * which is exactly what the official SDK does — this keeps the backend free of
 * an extra runtime dependency while remaining byte-compatible with Cloudinary.
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'ui-hub/avatars';

export const ALLOWED_AVATAR_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

/** True when every credential required to sign/upload is present. */
export const isCloudinaryConfigured = () =>
  Boolean(CLOUD_NAME && API_KEY && API_SECRET);

/**
 * Builds a Cloudinary signature over the given params.
 * Params are sorted alphabetically, joined as `k=v&k=v`, then the API secret is
 * appended and the whole string is sha1-hashed.
 * @param {Record<string, string|number>} params
 * @returns {string} hex signature
 */
export const signParams = (params, secret = API_SECRET) => {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(`${toSign}${secret}`).digest('hex');
};

/**
 * Produces the params the browser must echo back to Cloudinary together with
 * the signature. The `public_id` is derived so each user overwrites their own
 * avatar asset rather than accumulating orphaned files.
 *
 * @param {{ publicId?: string }} [options]
 * @returns {null | { cloudName: string, apiKey: string, timestamp: number, signature: string, folder: string, allowedFormats: string[], maxFileSize: number, publicId?: string }}
 */
export const createUploadSignature = ({ publicId } = {}) => {
  if (!isCloudinaryConfigured()) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    allowed_formats: ALLOWED_AVATAR_FORMATS.join(','),
    folder: UPLOAD_FOLDER,
    timestamp,
  };
  if (publicId) params.public_id = publicId;

  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    timestamp,
    signature: signParams(params),
    folder: UPLOAD_FOLDER,
    allowedFormats: ALLOWED_AVATAR_FORMATS,
    maxFileSize: MAX_AVATAR_BYTES,
    ...(publicId ? { publicId } : {}),
  };
};

/**
 * True when a URL points at an asset in THIS Cloudinary cloud. Used to reject
 * client-supplied avatar URLs that claim to be elsewhere.
 * @param {unknown} url
 * @returns {boolean}
 */
export const isOwnCloudinaryUrl = (url) => {
  if (typeof url !== 'string' || !CLOUD_NAME) return false;
  return url.startsWith(`https://res.cloudinary.com/${CLOUD_NAME}/`);
};

/**
 * Whether a public_id belongs to this cloud's avatar folder. Prevents a user
 * from destroying an arbitrary asset by passing someone else's public_id.
 * @param {unknown} publicId
 * @returns {boolean}
 */
export const isOwnAvatarPublicId = (publicId) => {
  if (typeof publicId !== 'string' || !publicId) return false;
  return publicId.startsWith(`${UPLOAD_FOLDER}/`);
};

/**
 * Deletes an avatar asset from Cloudinary via the signed destroy endpoint.
 * Never throws; returns a result object so callers can clear local state even
 * if the remote asset is already gone.
 *
 * @param {string} publicId
 * @returns {Promise<{ ok: boolean, result?: string, error?: string }>}
 */
export const destroyAsset = async (publicId) => {
  if (!isCloudinaryConfigured()) {
    return { ok: false, error: 'CLOUDINARY_NOT_CONFIGURED' };
  }
  if (!isOwnAvatarPublicId(publicId)) {
    return { ok: false, error: 'PUBLIC_ID_NOT_OWNED' };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signParams({ public_id: publicId, timestamp });
    const body = new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: API_KEY,
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      { method: 'POST', body }
    );
    const json = await res.json().catch(() => ({}));

    if (!res.ok || (json.result !== 'ok' && json.result !== 'not found')) {
      return { ok: false, error: json?.error?.message || `HTTP ${res.status}` };
    }
    return { ok: true, result: json.result };
  } catch (error) {
    return { ok: false, error: error?.message || 'destroy failed' };
  }
};

export default {
  isCloudinaryConfigured,
  createUploadSignature,
  signParams,
  isOwnCloudinaryUrl,
  isOwnAvatarPublicId,
  destroyAsset,
  ALLOWED_AVATAR_FORMATS,
  MAX_AVATAR_BYTES,
};
