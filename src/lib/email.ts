// SERVER ONLY — sends transactional email via the Resend REST API.

interface DonorInviteParams {
  to: string;
  donorName: string;
  bloodType: string;
  urgency: string;
  unitsNeeded: number;
  hospitalName: string;
  hospitalTownship: string | null;
  distanceKm: number | null;
  token: string;
}

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const sendDonorInviteEmail = async (p: DonorInviteParams) => {
  const apiKey = process.env.RESEND_API_KEY;
  const acceptUrl = `${siteUrl()}/match/${p.token}`;

  if (!apiKey) {
    console.log(`[email skipped — no RESEND_API_KEY] invite for ${p.to}: ${acceptUrl}`);
    return { sent: false as const, reason: "missing_api_key" };
  }

  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff7f7;border-radius:16px;border:1px solid #fecaca">
    <h2 style="color:#dc2626;margin:0 0 4px">LifeLink — Blood Donation Request</h2>
    <p style="color:#334155;font-size:15px">Hi ${p.donorName},</p>
    <p style="color:#334155;font-size:15px">
      A patient near you urgently needs <strong>${p.bloodType}</strong> blood and you are a compatible donor.
    </p>
    <table style="width:100%;font-size:14px;color:#0f172a;background:#ffffff;border-radius:12px;padding:8px" cellpadding="6">
      <tr><td style="color:#64748b">Urgency</td><td><strong>${p.urgency}</strong></td></tr>
      <tr><td style="color:#64748b">Blood type</td><td><strong>${p.bloodType}</strong> · ${p.unitsNeeded} unit(s)</td></tr>
      <tr><td style="color:#64748b">Donation at</td><td>${p.hospitalName}${p.hospitalTownship ? ", " + p.hospitalTownship : ""}</td></tr>
      ${p.distanceKm != null ? `<tr><td style="color:#64748b">Distance</td><td>~${p.distanceKm} km from you</td></tr>` : ""}
    </table>
    <p style="text-align:center;margin:24px 0">
      <a href="${acceptUrl}" style="background:#dc2626;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:15px;display:inline-block">
        Respond to this request
      </a>
    </p>
    <p style="color:#94a3b8;font-size:12px">
      Your exact location and contact details are never shared unless you accept.
      If you cannot donate right now, you can decline — no questions asked.
    </p>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "LifeLink <onboarding@resend.dev>",
      to: [p.to],
      subject: `${p.urgency} — ${p.bloodType} blood needed at ${p.hospitalName}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[resend] failed for ${p.to}:`, err);
    return { sent: false as const, reason: err };
  }
  return { sent: true as const };
};
