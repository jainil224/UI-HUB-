/**
 * UI-HUB — "New Components" Announcement Email Template (MINIMAL / IMAGE-FORWARD).
 *
 * Compact dark neo-brutalist layout (Background #0A0A0A, blue #3D5CFF,
 * yellow #FFC700, red #FF3B30). Images are the star: big animated GIF banner
 * up top, then a tight 2×2 grid of the new components, then one CTA.
 * Every <img> has explicit width/height + alt so layout stays intact even when
 * a client blocks remote images. All inline styles for email-client safety.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const prettyDate = (iso) => {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return iso;
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};

/**
 * Builds the announcement email HTML.
 *
 * @param {Object} [params]
 * @param {string} [params.name] Recipient first name
 * @param {Object} [params.manifest] from announcementManifest.json
 * @param {string} [params.frontendUrl] absolute origin for assets
 * @returns {string}
 */
export function buildAnnouncementEmailHtml({
    name = '',
    manifest = {},
    frontendUrl = '',
} = {}) {
    const displayName = (name && name !== 'there') ? name : 'Creator';
    const origin = frontendUrl || process.env.FRONTEND_URL || 'https://ui-hub-design.vercel.app';

    const total = manifest.totalComponents || 127;
    const latestDropDate = manifest.latestDropDate || '';
    const latestDropCount = manifest.latestDropCount || 1;
    const featured = (manifest.featured || []).slice(0, 5);
    const featuredCount = featured.length || manifest.latestDropCount || 1;
    const libraryUrl = `${origin}/library`;
    const componentUrl = (f) => `${origin}/library?id=${encodeURIComponent(f.id)}`;

    const assetUrl = (p) => (p ? `${origin}${p}` : '');

    // The 5 new additions as a centered 2+2+1 image grid at the bottom of the
    // email. Every card links straight to its own component page.
    const renderCard = (f) => `
                <table width="100%" cellpadding="0" cellspacing="0" style="width:100%; border:2px solid #FFFFFF; background-color:#0F0F0F;">
                  <tr>
                    <td style="padding:0; border-bottom:2px solid #FFFFFF;">
                      <a href="${componentUrl(f)}">
                        <img src="${assetUrl(f.thumbUrl)}" alt="${f.title}" width="250" height="140"
                             style="display:block; width:100%; height:auto; border:0; background-color:#111111;" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;">
                      <div style="font-size:11px; font-weight:900; color:#FFFFFF !important; text-transform:uppercase; letter-spacing:0.5px; line-height:1.3;">
                        <a href="${componentUrl(f)}" style="color:#FFFFFF !important; text-decoration:none;">${f.title}</a>
                      </div>
                      <div style="font-size:11px; color:#A1A1AA; line-height:1.5; margin-top:4px;">${f.description || ''}</div>
                    </td>
                  </tr>
                </table>`;

    const renderRow = (cells) => `
              <tr>
                <td style="padding:0 0 18px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse;">
                    ${cells}
                  </table>
                </td>
              </tr>`;

    const cardRows = (() => {
        const rows = [];
        for (let i = 0; i < featured.length; i += 2) {
            const left = featured[i];
            const right = featured[i + 1];
            if (right) {
                rows.push(renderRow(`
                    <tr>
                      <td width="47%" style="width:47%; padding:0 3% 0 0; vertical-align:top;">${renderCard(left)}</td>
                      <td width="47%" style="width:47%; padding:0 0 0 3%; vertical-align:top;">${renderCard(right)}</td>
                    </tr>`));
            } else {
                rows.push(renderRow(`
                    <tr>
                      <td align="center" style="vertical-align:top;">
                        <table width="250" cellpadding="0" cellspacing="0" style="width:100%; max-width:250px; margin:0 auto;">${renderCard(left)}</table>
                      </td>
                    </tr>`));
            }
        }
        return rows.join('');
    })();

    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="dark"/>
  <meta name="supported-color-schemes" content="dark"/>
  <title>UI HUB — ${featuredCount} New Components Landed</title>
  <style>
    :root { color-scheme: dark; }
  </style>
</head>
<body bgcolor="#0A0A0A" style="margin:0; padding:0; background-color:#0A0A0A !important; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#FFFFFF; -webkit-font-smoothing:antialiased;">
  <div style="background-color:#0A0A0A !important; width:100%; margin:0; padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0A0A0A" style="background-color:#0A0A0A !important; padding:32px 16px; width:100%;">
      <tr>
        <td align="center" bgcolor="#0A0A0A" style="background-color:#0A0A0A !important;">
          <!-- Main Card -->
          <table width="560" cellpadding="0" cellspacing="0" bgcolor="#0A0A0A" style="max-width:560px; width:100%; background-color:#0A0A0A !important; border:2px solid #FFFFFF; border-collapse:collapse;">

            <!-- Header -->
            <tr>
              <td bgcolor="#000000" style="background-color:#000000 !important; padding:18px 20px; text-align:center;">
                <div style="font-size:22px; font-weight:900; color:#FFFFFF !important; letter-spacing:5px; text-transform:uppercase;">
                  UI&nbsp;HUB
                </div>
                <div style="height:5px; line-height:5px; font-size:0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
                    <tr>
                      <td width="33.33%" style="width:33.33%; height:5px; background-color:#3D5CFF;"></td>
                      <td width="33.33%" style="width:33.33%; height:5px; background-color:#FFC700;"></td>
                      <td width="33.33%" style="width:33.33%; height:5px; background-color:#FF3B30;"></td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td bgcolor="#0A0A0A" style="padding:28px 26px 24px 26px; background-color:#0A0A0A !important; text-align:left;">

                <!-- Badge -->
                <span style="display:inline-block; background-color:#FFC700; color:#000000 !important; font-size:10px; font-weight:900; padding:5px 12px; border:2px solid #FFFFFF; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:14px;">
                  ⚡ WE MISSED YOU
                </span>

                <!-- Headline -->
                <h1 style="font-size:24px; font-weight:900; color:#FFFFFF !important; text-transform:uppercase; letter-spacing:0.5px; margin:14px 0 6px 0; line-height:1.2;">
                  Hey ${displayName}, ${featuredCount} new components landed while you were away
                </h1>

                <!-- One-liner -->
                <p style="font-size:13px; color:#A1A1AA; line-height:1.6; margin:0 0 22px 0; font-weight:500;">
                  UI HUB is now <strong style="color:#FFFFFF;">${total}+ components live</strong> — and five brand-new ones are waiting for you below.
                </p>

                <!-- CTA -->
                <div style="margin:0 0 26px 0;">
                  <a href="${libraryUrl}"
                     style="display:block; width:100%; box-sizing:border-box; text-align:center; background-color:#3D5CFF; color:#FFFFFF !important; text-decoration:none; font-weight:900; font-size:13px; padding:15px 20px; border:2px solid #FFFFFF; text-transform:uppercase; letter-spacing:1.5px;">
                    COME SEE WHAT'S NEW →
                  </a>
                </div>

                ${featured.length ? `
                <!-- 5 new additions (bottom, centered) -->
                <div style="text-align:center; font-size:11px; font-weight:900; color:#3D5CFF; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:14px;">
                  ✨ THE NEW ADDITIONS
                </div>
                ${cardRows}
                ` : ''}

                <!-- Link fallback -->
                <div style="background-color:#141414; border:1.5px solid #333333; padding:10px 12px; font-family:monospace; font-size:11px; color:#3D5CFF; word-break:break-all;">
                  <a href="${libraryUrl}" style="color:#3D5CFF; text-decoration:underline;">${libraryUrl}</a>
                </div>

              </td>
            </tr>

            <!-- Minimal footer -->
            <tr>
              <td bgcolor="#000000" style="background-color:#000000 !important; padding:14px 20px; text-align:center;">
                <span style="color:#71717A; font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;">
                  © ${new Date().getFullYear()} UI HUB&nbsp;&nbsp;·&nbsp;&nbsp;
                </span>
                <a href="${libraryUrl}" style="color:#3D5CFF; font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; text-decoration:none;">
                  Component Library
                </a>
                <span style="color:#71717A; font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;">
                  &nbsp;&nbsp;·&nbsp;&nbsp;
                </span>
                <a href="mailto:uihub.design@gmail.com?subject=Unsubscribe" style="color:#71717A; font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; text-decoration:none;">
                  Unsubscribe
                </a>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `;
}