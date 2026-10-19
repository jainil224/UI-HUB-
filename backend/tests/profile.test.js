import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

/* ─────────────────────────────────────────────────────────────────────────
 * Cloudinary signing (pure — no network)
 * ───────────────────────────────────────────────────────────────────────── */

const CLOUD_ENV = {
  CLOUDINARY_CLOUD_NAME: 'demo-cloud',
  CLOUDINARY_API_KEY: '123456789012345',
  CLOUDINARY_API_SECRET: 'test-secret',
  CLOUDINARY_UPLOAD_FOLDER: 'ui-hub/avatars',
};

/** Re-imports the module with a fresh module cache so env vars are re-read. */
let cloudinaryImportId = 0;
const loadCloudinary = async (env) => {
  const saved = {};
  for (const key of Object.keys(CLOUD_ENV)) {
    saved[key] = process.env[key];
    // Set '' rather than deleting: the service calls dotenv.config() itself,
    // which would otherwise refill missing keys from the real .env file.
    process.env[key] = env[key] === undefined ? '' : env[key];
  }
  try {
    return await import(`../src/services/cloudinaryService.js?t=${++cloudinaryImportId}`);
  } finally {
    for (const key of Object.keys(CLOUD_ENV)) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
};

/** Independent reimplementation of Cloudinary's documented signature. */
const expectedSignature = (params, secret) =>
  crypto
    .createHash('sha1')
    .update(
      Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join('&') + secret
    )
    .digest('hex');

test('signParams matches the Cloudinary sha1 contract', async () => {
  const { signParams } = await loadCloudinary(CLOUD_ENV);
  const params = { timestamp: 1234567890, folder: 'ui-hub/avatars', allowed_formats: 'jpg,png' };
  assert.equal(signParams(params), expectedSignature(params, CLOUD_ENV.CLOUDINARY_API_SECRET));
});

test('signParams is order-independent and secret-sensitive', async () => {
  const { signParams } = await loadCloudinary(CLOUD_ENV);
  const a = { b: '2', a: '1', c: '3' };
  const b = { c: '3', a: '1', b: '2' };
  assert.equal(signParams(a), signParams(b));
  assert.notEqual(signParams(a), signParams(a, 'a-different-secret'));
});

test('signParams omits null/undefined values', async () => {
  const { signParams } = await loadCloudinary(CLOUD_ENV);
  const withNulls = { a: '1', b: null, c: undefined, d: '4' };
  assert.equal(signParams(withNulls), signParams({ a: '1', d: '4' }));
});

test('createUploadSignature returns a signed, folder-scoped payload', async () => {
  const { createUploadSignature } = await loadCloudinary(CLOUD_ENV);
  const sig = createUploadSignature();
  assert.ok(sig, 'expected a signature when configured');
  assert.equal(sig.cloudName, 'demo-cloud');
  assert.equal(sig.apiKey, '123456789012345');
  assert.equal(sig.folder, 'ui-hub/avatars');
  assert.deepEqual(sig.allowedFormats, ['jpg', 'jpeg', 'png', 'webp']);
  assert.ok(Number.isInteger(sig.timestamp));
  assert.equal(
    sig.signature,
    expectedSignature(
      {
        allowed_formats: 'jpg,jpeg,png,webp',
        folder: 'ui-hub/avatars',
        timestamp: sig.timestamp,
      },
      CLOUD_ENV.CLOUDINARY_API_SECRET
    )
  );
  // The secret must never be serialized to the client.
  assert.equal(JSON.stringify(sig).includes(CLOUD_ENV.CLOUDINARY_API_SECRET), false);
});

test('createUploadSignature is null when unconfigured', async () => {
  const { createUploadSignature, isCloudinaryConfigured } = await loadCloudinary({
    CLOUDINARY_CLOUD_NAME: undefined,
    CLOUDINARY_API_KEY: undefined,
    CLOUDINARY_API_SECRET: undefined,
  });
  assert.equal(isCloudinaryConfigured(), false);
  assert.equal(createUploadSignature(), null);
});

test('isOwnCloudinaryUrl only accepts urls from this cloud', async () => {
  const { isOwnCloudinaryUrl } = await loadCloudinary(CLOUD_ENV);
  assert.equal(isOwnCloudinaryUrl('https://res.cloudinary.com/demo-cloud/image/upload/v1/x.png'), true);
  assert.equal(isOwnCloudinaryUrl('https://res.cloudinary.com/evil-cloud/image/upload/x.png'), false);
  assert.equal(isOwnCloudinaryUrl('https://example.com/x.png'), false);
  assert.equal(isOwnCloudinaryUrl(null), false);
  assert.equal(isOwnCloudinaryUrl(''), false);
});

test('isOwnAvatarPublicId only accepts ids inside the avatar folder', async () => {
  const { isOwnAvatarPublicId } = await loadCloudinary(CLOUD_ENV);
  assert.equal(isOwnAvatarPublicId('ui-hub/avatars/abc123'), true);
  assert.equal(isOwnAvatarPublicId('ui-hub/other/abc123'), false);
  assert.equal(isOwnAvatarPublicId('abc123'), false);
  assert.equal(isOwnAvatarPublicId(''), false);
});

test('destroyAsset refuses foreign ids and unconfigured clouds (no network)', async () => {
  const configured = await loadCloudinary(CLOUD_ENV);
  assert.deepEqual(await configured.destroyAsset('someone-elses/asset'), {
    ok: false,
    error: 'PUBLIC_ID_NOT_OWNED',
  });

  const unconfigured = await loadCloudinary({
    CLOUDINARY_CLOUD_NAME: undefined,
    CLOUDINARY_API_KEY: undefined,
    CLOUDINARY_API_SECRET: undefined,
  });
  assert.deepEqual(await unconfigured.destroyAsset('ui-hub/avatars/abc'), {
    ok: false,
    error: 'CLOUDINARY_NOT_CONFIGURED',
  });
});

/** Runs `fn` with `global.fetch` replaced, restoring it afterwards. */
const withFetch = async (impl, fn) => {
  const original = global.fetch;
  global.fetch = impl;
  try {
    return await fn();
  } finally {
    global.fetch = original;
  }
};

test('getAssetInfo reads the real asset bytes via the Admin API', async () => {
  const { getAssetInfo } = await loadCloudinary(CLOUD_ENV);
  let calledUrl;
  const info = await withFetch(
    async (url) => {
      calledUrl = String(url);
      return {
        ok: true,
        json: async () => ({
          resources: [
            { public_id: 'ui-hub/avatars/abc', bytes: 1234, width: 512, height: 512, format: 'png' },
          ],
        }),
      };
    },
    () => getAssetInfo('ui-hub/avatars/abc')
  );
  assert.equal(info.bytes, 1234);
  assert.equal(info.width, 512);
  assert.equal(info.format, 'png');
  assert.ok(calledUrl.includes('/resources/image/upload'));
  assert.ok(calledUrl.includes('public_ids'));
});

test('getAssetInfo returns null when the asset is missing', async () => {
  const { getAssetInfo } = await loadCloudinary(CLOUD_ENV);
  const info = await withFetch(
    async () => ({ ok: true, json: async () => ({ resources: [] }) }),
    () => getAssetInfo('ui-hub/avatars/none')
  );
  assert.equal(info, null);
});

test('getAssetInfo throws on an Admin API error', async () => {
  const { getAssetInfo } = await loadCloudinary(CLOUD_ENV);
  await assert.rejects(
    withFetch(async () => ({ ok: false, status: 500 }), () => getAssetInfo('ui-hub/avatars/abc')),
    /HTTP 500/
  );
});

test('getAssetInfo throws when Cloudinary is unconfigured', async () => {
  const { getAssetInfo } = await loadCloudinary({
    CLOUDINARY_CLOUD_NAME: undefined,
    CLOUDINARY_API_KEY: undefined,
    CLOUDINARY_API_SECRET: undefined,
  });
  await assert.rejects(() => getAssetInfo('ui-hub/avatars/abc'), /CLOUDINARY_NOT_CONFIGURED/);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Profile validators
 * ───────────────────────────────────────────────────────────────────────── */

/** Runs an express-validator chain against a fake request. */
const runValidatorChain = (chain, body) =>
  new Promise((resolve, reject) => {
    const req = { body, headers: {}, method: 'PUT', url: '/profile' };
    let index = 0;
    const res = {
      statusCode: 200,
      _body: undefined,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this._body = payload;
        resolve({ status: this.statusCode, body: payload });
      },
    };
    const next = (err) => {
      if (err) return reject(err);
      const layer = chain[index++];
      if (!layer) return resolve({ status: 200, body: undefined, passed: true });
      try {
        layer(req, res, next);
      } catch (e) {
        reject(e);
      }
    };
    next();
  });

test('validateUpdateProfile accepts a valid payload', async () => {
  const { validateUpdateProfile } = await import('../src/middleware/validators.js');
  const result = await runValidatorChain(validateUpdateProfile, {
    displayName: 'Ada Lovelace',
    username: 'Jainil1',
    avatarUrl: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/av.png',
    avatarPublicId: 'ui-hub/avatars/abc',
  });
  assert.equal(result.passed, true);
  assert.equal(result.status, 200);
});

test('validateUpdateProfile rejects a username without a leading capital', async () => {
  const { validateUpdateProfile } = await import('../src/middleware/validators.js');
  const result = await runValidatorChain(validateUpdateProfile, { username: 'jainil1' });
  assert.equal(result.status, 400);
  assert.ok(result.body.errors.some((e) => e.path === 'username'));
});

test('validateUpdateProfile rejects an invalid username', async () => {
  const { validateUpdateProfile } = await import('../src/middleware/validators.js');
  const result = await runValidatorChain(validateUpdateProfile, { username: 'ab' });
  assert.equal(result.status, 400);
  assert.equal(result.body.success, false);
  assert.ok(result.body.errors.some((e) => e.path === 'username'));
});

test('validateUpdateProfile rejects an over-long display name', async () => {
  const { validateUpdateProfile } = await import('../src/middleware/validators.js');
  const result = await runValidatorChain(validateUpdateProfile, { displayName: 'x'.repeat(16) });
  assert.equal(result.status, 400);
  assert.ok(result.body.errors.some((e) => e.path === 'displayName'));
});

test('validateUpdateProfile accepts a 15-character display name', async () => {
  const { validateUpdateProfile } = await import('../src/middleware/validators.js');
  const result = await runValidatorChain(validateUpdateProfile, { displayName: 'x'.repeat(15) });
  assert.equal(result.passed, true);
});

test('validateUpdateProfile allows clearing the avatar with null', async () => {
  const { validateUpdateProfile } = await import('../src/middleware/validators.js');
  const result = await runValidatorChain(validateUpdateProfile, { avatarUrl: null, avatarPublicId: null });
  assert.equal(result.passed, true);
});

/* ─────────────────────────────────────────────────────────────────────────
 * userService pure helpers
 * ───────────────────────────────────────────────────────────────────────── */

test('normalizeUsername trims and lowercases', async () => {
  const { normalizeUsername } = await import('../src/services/userService.js');
  assert.equal(normalizeUsername('  Ada_Dev '), 'ada_dev');
  assert.equal(normalizeUsername(null), '');
  assert.equal(normalizeUsername(undefined), '');
});

test('normalizeDisplayName trims and lowercases', async () => {
  const { normalizeDisplayName } = await import('../src/services/userService.js');
  assert.equal(normalizeDisplayName('  Jainil22 '), 'jainil22');
  assert.equal(normalizeDisplayName(null), '');
  assert.equal(normalizeDisplayName(undefined), '');
});

test('DISPLAY_NAME_MAX is 15', async () => {
  const { DISPLAY_NAME_MAX } = await import('../src/services/userService.js');
  assert.equal(DISPLAY_NAME_MAX, 15);
});

test('USERNAME_RE enforces the documented handle rules', async () => {
  const { USERNAME_RE } = await import('../src/services/userService.js');
  assert.equal(USERNAME_RE.test('Ja1'), true, 'minimum length with a digit');
  assert.equal(USERNAME_RE.test('J_1'), true);
  assert.equal(USERNAME_RE.test('J-1'), true);
  assert.equal(USERNAME_RE.test('Jainil1'), true);
  assert.equal(USERNAME_RE.test('Jainil01'), true, '8 characters is allowed');
  assert.equal(USERNAME_RE.test('Jainil123456789'), true, 'maximum length (15)');
  assert.equal(USERNAME_RE.test('JaNiL01'), true, 'case after the first letter is free');
  assert.equal(USERNAME_RE.test('JAINIL1'), true);
  assert.equal(USERNAME_RE.test('Jain_1'), true);
  assert.equal(USERNAME_RE.test('J1'), false, 'too short');
  assert.equal(USERNAME_RE.test('Jainil1234567890'), false, 'too long (16)');
  assert.equal(USERNAME_RE.test('jainil1'), false, 'must start with a capital letter');
  assert.equal(USERNAME_RE.test('1ainil'), false, 'cannot start with a number');
  assert.equal(USERNAME_RE.test('Jainil'), false, 'a number is required');
  assert.equal(USERNAME_RE.test('J.1'), false, 'dot is not allowed');
  assert.equal(USERNAME_RE.test('J 1'), false, 'spaces are not allowed');
  assert.equal(USERNAME_RE.test('J@1'), false, 'other symbols are not allowed');
});

test('ProfileError carries a code and status', async () => {
  const { ProfileError } = await import('../src/services/userService.js');
  const err = new ProfileError('nope', 'USERNAME_TAKEN', 409);
  assert.ok(err instanceof Error);
  assert.equal(err.name, 'ProfileError');
  assert.equal(err.code, 'USERNAME_TAKEN');
  assert.equal(err.status, 409);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Route wiring — the avatar/profile endpoints must exist and be guarded
 * ───────────────────────────────────────────────────────────────────────── */

test('userRoutes exposes the profile endpoints', async () => {
  const { default: router } = await import('../src/routes/userRoutes.js');
  const routes = new Map();
  for (const layer of router.stack || []) {
    if (layer.route) {
      const path = layer.route.path;
      for (const [method, enabled] of Object.entries(layer.route.methods || {})) {
        if (enabled) routes.set(`${method.toUpperCase()} ${path}`, layer.route.stack.length);
      }
    }
  }
  assert.ok(routes.has('GET /profile'), 'missing GET /profile');
  assert.ok(routes.has('PUT /profile'), 'missing PUT /profile');
  assert.ok(routes.has('GET /username-available'), 'missing GET /username-available');
  assert.ok(routes.has('GET /display-name-available'), 'missing GET /display-name-available');
  assert.ok(routes.has('POST /avatar-signature'), 'missing POST /avatar-signature');
  assert.ok(routes.has('DELETE /avatar'), 'missing DELETE /avatar');

  // Each mutating route must carry more than just its handler (auth/limiter/validator).
  assert.ok(routes.get('PUT /profile') >= 4, 'PUT /profile is missing guards');
  assert.ok(routes.get('POST /avatar-signature') >= 3, 'POST /avatar-signature is missing guards');
});
