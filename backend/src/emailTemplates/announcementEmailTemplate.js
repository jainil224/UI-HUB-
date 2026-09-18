/**
 * UI-HUB — "New Components" Announcement Email Template.
 *
 * Dark, neo-brutalist layout matching the UI-HUB brand (Background #0A0A0A,
 * accent blue #3D5CFF, red #FF3B30, yellow #FFC700) in an OriginKit-style
 * announcement format: badge → headline → "What's new" bullets → live-total
 * line → feature cards → CTA → animated GIF showcase banner → footer.
 *
 * Everything is inline-styled (dense tables) for maximum email-client
 * compatibility, with the animated banner referenced by absolute URL so the
 * message stays well under Gmail's ~102KB clipping limit.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const prettyDate = (iso) => {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return iso;
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};

const buildColorStrip = () => `
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
        <tr>
          <td width="33.33%" style="width:33.33%; height:8px; font-size:0; line-height:0; background-color:#3D5CFF;"></td>
          <td width="33.33%" style="width:33.33%; height:8px; font-size:0; line-height:0; background-color:#FFC700;"></td>
          <td width="33.33%" style="width:33.33%; height:8px; font-size:0; line-height:0; background-color:#FF3B30;"></td>
        </tr>
      </table>
    </td>
  </tr>
`;

/**
 * Builds the announcement email HTML.
 *
 * @param {Object} [params]
 * @param {string} [params.name] Recipient first name
 * @param {Object} [params.manifest] manifest snapshot from announcementManifest.json
 *   { totalComponents, latestDropDate, latestDropCount, latestDropByCategory,
 *     thirtyDayCount, featured, bannerImage }
 * @param {string} [params.frontendUrl] absolute CDN/website origin for assets
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
    const thirtyDayCount = manifest.thirtyDayCount || latestDropCount;
    const latestDropByCategory = manifest.latestDropByCategory || {};
    const featured = manifest.featured || [];
    const bannerUrl = `${origin}${manifest.bannerImage || '/assets/component-previews/announcement-banner.gif'}`;
    const libraryUrl = `${origin}/library`;

    const assetUrl = (p) => (p ? `${origin}${p}` : '');

    // OriginKit-style "What's new" bullet list.
    const categoryBullets = Object.entries(latestDropByCategory)
        .sort((a, b) => b[1] - a[1])
        .map(
            ([category, count], idx, arr) => {
                const label = category.replace(/-/g, ' ');
                const subject = count > 1 && !/(s|x|ch)$/i.test(label) ? `${label}s` : label;
                return `
                <table width="100%" cellpadding="0" cellspacing="0" style="width:100%; margin:0 0 ${idx === arr.length - 1 ? '0' : '10px'} 0;">
                  <tr>
                    <td style="padding:0;">
                      <span style="display:inline-block; width:10px; height:10px; background-color:#3D5CFF; border:2px solid #FFFFFF; margin-right:10px; vertical-align:middle;"></span>
                      <span style="font-size:14px; font-weight:900; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">
                        ${count} new ${subject}
                      </span>
                    </td>
                  </tr>
                </table>`;
            },
        )
        .join('');

    // "What's New" feature cards (2-up rows).
    const featureRows = (() => {
        const rows = [];
        for (let i = 0; i < featured.length; i += 2) {
            const left = featureCardsForRow(featured, i);
            const right = featureCardsForRow(featured, i + 1);
            rows.push(`
              <tr>
                <td style="padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse;">
                    <tr>
                      ${left}
                      ${right}
                    </tr>
                  </table>
                </td>
              </tr>`);
        }
        return rows.join('');
    })();

    function featureCardsForRow(list, idx) {
        const f = list[idx];
        if (!f) return '<td width="47%" style="width:47%;"></td>';
        const thumb = assetUrl(f.thumbUrl);
        const side = idx % 2 === 0 ? 'right' : 'left';
        return `
        <td width="47%" style="width:47%; text-align:left; padding:${side === 'right' ? '0 6% 0 0' : '0 0 0 6%'}; vertical-align:top;">
          <table width="100%" cellpadding="0" cellspacing="0" style="width:100%; border:2px solid #FFFFFF; background-color:#0F0F0F; margin:0 0 18px 0;">
            ${
                thumb
                    ? `<tr>
                        <td style="padding:0; border-bottom:2px solid #FFFFFF;">
                          <img src="${thumb}" alt="${f.title}" width="100%" style="display:block; width:100%; height:auto; border:0;" />
                        </td>
                      </tr>`
                    : ''
            }
            <tr>
              <td style="padding:12px 14px 16px 14px; text-align:left;">
                <span style="display:inline-block; background-color:#3D5CFF; color:#FFFFFF !important; font-size:8px; font-weight:900; padding:3px 7px; border:1.5px solid #FFFFFF; text-transform:uppercase; letter-spacing:1px; margin-bottom:7px;">
                  ${(f.categoryLabel || 'NEW').toUpperCase()}
                </span>
                <div style="font-size:12px; font-weight:900; color:#FFFFFF !important; text-transform:uppercase; letter-spacing:0.3px; margin-bottom:5px; line-height:1.3;">
                  ${f.title}
                </div>
                <div style="font-size:10px; color:#A1A1AA; line-height:1.5; font-weight:500;">
                  ${f.description || ''}
                </div>
              </td>
            </tr>
          </table>
        </td>`;
    }

    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="dark"/>
  <meta name="supported-color-schemes" content="dark"/>
  <title>UI HUB — ${latestDropCount} New Components Landed</title>
  <style>
    :root { color-scheme: dark; }
  </style>
</head>
<body bgcolor="#0A0A0A" style="margin:0; padding:0; background-color:#0A0A0A !important; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#FFFFFF; -webkit-font-smoothing:antialiased;">
  <div style="background-color:#0A0A0A !important; width:100%; margin:0; padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0A0A0A" style="background-color:#0A0A0A !important; padding:40px 16px; width:100%;">
      <tr>
        <td align="center" bgcolor="#0A0A0A" style="background-color:#0A0A0A !important;">
          <!-- Main Card -->
          <table width="580" cellpadding="0" cellspacing="0" bgcolor="#0A0A0A" style="max-width:580px; width:100%; background-color:#0A0A0A !important; border:2px solid #FFFFFF; border-collapse:collapse;">

            <!-- Top Header Bar -->
            <tr>
              <td bgcolor="#000000" style="background-color:#000000 !important; padding:26px 20px; text-align:center;">
                <div style="font-size:26px; font-weight:900; color:#FFFFFF !important; letter-spacing:5px; text-transform:uppercase;">
                  UI&nbsp;HUB
                </div>
                <div style="font-size:9px; color:#71717A; letter-spacing:3px; text-transform:uppercase; margin-top:4px;">
                  Component Platform
                </div>
              </td>
            </tr>

            ${buildColorStrip()}

            <!-- Content -->
            <tr>
              <td bgcolor="#0A0A0A" style="padding:36px 30px 30px 30px; background-color:#0A0A0A !important; text-align:left;">

                <!-- Badge -->
                <div style="margin-bottom:20px;">
                  <span style="display:inline-block; background-color:#FFC700; color:#000000 !important; font-size:11px; font-weight:900; padding:6px 14px; border:2px solid #FFFFFF; text-transform:uppercase; letter-spacing:1.5px;">
                    ⚡ NEW COMPONENTS DROPPED
                  </span>
                </div>

                <!-- Headline -->
                <h1 style="font-size:28px; font-weight:900; color:#FFFFFF !important; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px 0; line-height:1.15;">
                  Hey ${displayName}, we added<br/>${latestDropCount} new components${latestDropDate ? ' ' + prettyDate(latestDropDate) : ''}
                </h1>

                <!-- Copy -->
                <p style="font-size:14px; color:#A1A1AA; line-height:1.7; margin:0 0 26px 0; font-weight:500;">
                  ${thirtyDayCount > latestDropCount ? `${thirtyDayCount} fresh components landed in the last 30 days — and UI HUB now has ` : `UI HUB now has `}<strong style="color:#FFFFFF;">${total}+ components live</strong> — cinema-grade WebGL canvases, fluid cursor systems, and scroll choreography ready to drop straight into your builds.
                </p>

                <!-- What's New Section Header -->
                <div style="font-size:12px; font-weight:900; color:#3D5CFF; letter-spacing:1px; text-transform:uppercase; margin-bottom:16px;">
                  ✨ WHAT'S NEW
                </div>

                ${categoryBullets}

                <!-- Total line -->
                <table width="100%" cellpadding="0" cellspacing="0" style="width:100%; border:2px solid #FFFFFF; background-color:#3D5CFF; margin:14px 0 28px 0; border-collapse:collapse;">
                  <tr>
                    <td style="padding:14px 18px; text-align:center;">
                      <span style="font-size:14px; font-weight:900; color:#FFFFFF !important; text-transform:uppercase; letter-spacing:1.5px;">
                        🚀 UI HUB NOW HAS ${total}+ COMPONENTS LIVE
                      </span>
                    </td>
                  </tr>
                </table>

                ${featured.length ? `
                <!-- Featured Cards Header -->
                <div style="font-size:12px; font-weight:900; color:#FFFFFF; letter-spacing:1px; text-transform:uppercase; margin-bottom:16px;">
                  🔥 THE NEW ADDITIONS
                </div>

                ${featureRows}

                ` : ''}

                <!-- Slotify-Style CTA Button -->
                <div style="margin:26px 0 24px 0;">
                  <a href="${libraryUrl}"
                     style="display:block; width:100%; box-sizing:border-box; text-align:center; background-color:#3D5CFF; color:#FFFFFF !important; text-decoration:none; font-weight:900; font-size:13px; padding:16px 20px; border:2px solid #FFFFFF; text-transform:uppercase; letter-spacing:1.5px;">
                    EXPLORE THE NEW ADDITIONS →
                  </a>
                </div>

                <!-- Link Fallback Box -->
                <p style="font-size:12px; color:#A1A1AA; margin:0 0 8px 0;">
                  Or copy and paste this link in your browser:
                </p>
                <div style="background-color:#141414; border:1.5px solid #FFFFFF; padding:12px 14px; font-family:monospace; font-size:12px; color:#3D5CFF; word-break:break-all; margin-bottom:30px;">
                  <a href="${libraryUrl}" style="color:#3D5CFF; text-decoration:underline;">${libraryUrl}</a>
                </div>

                <!-- Animated Showcase Banner -->
                <div style="border:2px solid #FFFFFF; background-color:#000000; padding:8px; margin-bottom:4px;">
                  <img src="${bannerUrl}" alt="UI HUB component showcase" width="100%" style="display:block; width:100%; height:auto; border:0;" />
                </div>
                <p style="font-size:10px; color:#52525B; text-transform:uppercase; letter-spacing:1.5px; text-align:center; margin:6px 0 0 0;">
                  A preview of our interactive backgrounds
                </p>

                <!-- Sign-off -->
                <p style="font-size:13px; color:#A1A1AA; margin:32px 0 4px 0;">Best regards,</p>
                <p style="font-size:14px; color:#FFFFFF; font-weight:900; margin:0;">The UI HUB Engineering Team</p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td bgcolor="#000000" style="background-color:#000000 !important; padding:24px 20px; text-align:center;">
                <p style="color:#FFFFFF !important; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin:0 0 6px 0;">
                  © ${new Date().getFullYear()} UI HUB COMPONENT PLATFORM
                </p>
                <p style="color:#71717A; font-size:9px; letter-spacing:1.5px; text-transform:uppercase; margin:0 0 14px 0;">
                  CINEMA-GRADE UI • MASTER AI PROMPTS • ZERO BLOAT
                </p>
                <a href="${libraryUrl}" style="color:#3D5CFF; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; text-decoration:none; margin:0 12px;">
                  Component Library
                </a>
                <a href="mailto:uihub.design@gmail.com?subject=Unsubscribe" style="color:#71717A; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; text-decoration:none; margin:0 12px;">
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