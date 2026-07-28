export type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service_type?: string | null;
  budget_range?: string | null;
  message: string;
  source_page?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  marketing_consent?: boolean | null;
  privacy_accepted?: boolean | null;
  created_at: string;
  notification_attempts?: number | null;
};

type AdminTemplateOptions = {
  lead: LeadRecord;
  publicSiteUrl: string;
};

export function buildAdminEmail({ lead, publicSiteUrl }: AdminTemplateOptions) {
  const subject =
    `Új ajánlatkérés: ${lead.name}` +
    (lead.service_type ? ` – ${lead.service_type}` : "");

  const adminUrl = `${publicSiteUrl.replace(/\/+$/, "")}/admin/leads`;

  const rows = [
    ["Név", lead.name],
    ["E-mail", lead.email],
    ["Telefon", lead.phone || "Nincs megadva"],
    ["Vállalkozás", lead.company || "Nincs megadva"],
    ["Szolgáltatás", lead.service_type || "Nincs megadva"],
    ["Költségkeret", lead.budget_range || "Nincs megadva"],
    ["Marketing-hozzájárulás", lead.marketing_consent ? "Igen" : "Nem"],
    ["Beérkezés", formatHungarianDate(lead.created_at)],
    ["Forrásoldal", lead.source_page || "Nincs adat"],
    [
      "UTM",
      [lead.utm_source, lead.utm_medium, lead.utm_campaign]
        .filter(Boolean)
        .join(" / ") || "Nincs adat",
    ],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;vertical-align:top;width:180px;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;font-weight:600;vertical-align:top;">
            ${escapeHtml(value)}
          </td>
        </tr>
      `,
    )
    .join("");

  const html = `
<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="padding:32px 16px;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">
      <div style="background:#1e3a8a;padding:28px 32px;color:#ffffff;">
        <div style="font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.75;">
          PandaDesign leadértesítés
        </div>
        <h1 style="margin:10px 0 0;font-size:28px;line-height:1.25;">
          Új ajánlatkérés érkezett
        </h1>
      </div>

      <div style="padding:28px 32px;">
        <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#374151;">
          <strong>${escapeHtml(lead.name)}</strong> új megkeresést küldött a PandaDesign weboldalán.
        </p>

        <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          ${rowsHtml}
        </table>

        <div style="margin-top:24px;">
          <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">
            Üzenet
          </div>
          <div style="margin-top:10px;padding:18px;border-radius:14px;background:#f9fafb;border:1px solid #e5e7eb;font-size:15px;line-height:1.7;white-space:pre-wrap;color:#111827;">${escapeHtml(
            lead.message,
          )}</div>
        </div>

        <div style="margin-top:28px;">
          <a href="${escapeHtml(
            adminUrl,
          )}" style="display:inline-block;background:#1e3a8a;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:12px;">
            Lead megnyitása az adminban
          </a>
        </div>

        <p style="margin:26px 0 0;font-size:12px;line-height:1.6;color:#9ca3af;">
          Erre az e-mailre válaszolva közvetlenül az érdeklődőnek írsz.
          Leadazonosító: ${escapeHtml(lead.id)}
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = [
    "Új PandaDesign ajánlatkérés",
    "",
    `Név: ${lead.name}`,
    `E-mail: ${lead.email}`,
    `Telefon: ${lead.phone || "Nincs megadva"}`,
    `Vállalkozás: ${lead.company || "Nincs megadva"}`,
    `Szolgáltatás: ${lead.service_type || "Nincs megadva"}`,
    `Költségkeret: ${lead.budget_range || "Nincs megadva"}`,
    "",
    "Üzenet:",
    lead.message,
    "",
    `Admin: ${adminUrl}`,
    `Leadazonosító: ${lead.id}`,
  ].join("\n");

  return {
    subject,
    html,
    text,
  };
}

export function buildAutoreplyEmail(lead: LeadRecord) {
  const subject = "Megkaptuk az ajánlatkérésed – PandaDesign";

  const html = `
<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="padding:32px 16px;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">
      <div style="background:#1e3a8a;padding:28px 32px;color:#ffffff;">
        <div style="font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.75;">
          PandaDesign
        </div>
        <h1 style="margin:10px 0 0;font-size:28px;line-height:1.25;">
          Köszönjük a megkeresést!
        </h1>
      </div>

      <div style="padding:28px 32px;">
        <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
          Kedves ${escapeHtml(lead.name)}!
        </p>

        <p style="margin:18px 0 0;font-size:16px;line-height:1.7;color:#374151;">
          Az ajánlatkérésed sikeresen megérkezett. Átnézzük a megadott információkat, és a lehető leghamarabb felvesszük veled a kapcsolatot.
        </p>

        <div style="margin-top:24px;padding:18px;border-radius:14px;background:#f9fafb;border:1px solid #e5e7eb;">
          <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">
            A megkeresésed témája
          </div>
          <div style="margin-top:8px;font-size:15px;font-weight:700;color:#111827;">
            ${escapeHtml(lead.service_type || "Weboldal és digitális megoldás")}
          </div>
        </div>

        <p style="margin:26px 0 0;font-size:14px;line-height:1.7;color:#6b7280;">
          Üdvözlettel,<br>
          <strong style="color:#111827;">PandaDesign</strong>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = [
    `Kedves ${lead.name}!`,
    "",
    "Az ajánlatkérésed sikeresen megérkezett.",
    "Átnézzük a megadott információkat, és a lehető leghamarabb felvesszük veled a kapcsolatot.",
    "",
    "Üdvözlettel,",
    "PandaDesign",
  ].join("\n");

  return {
    subject,
    html,
    text,
  };
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatHungarianDate(value: string) {
  try {
    return new Intl.DateTimeFormat("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Budapest",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
