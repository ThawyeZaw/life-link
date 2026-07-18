// SERVER ONLY — sends transactional email via Gmail SMTP (Nodemailer).

import nodemailer from "nodemailer";

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
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const acceptUrl = `${siteUrl()}/match/${p.token}`;

  if (!user || !pass) {
    console.log(`[email skipped — missing GMAIL_USER/GMAIL_APP_PASSWORD] invite for ${p.to}: ${acceptUrl}`);
    return { sent: false as const, reason: "missing_smtp_credentials" };
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;font-family:Segoe UI,Arial,sans-serif">
<div style="max-width:520px;margin:24px auto;padding:24px;background:#fff7f7;border-radius:16px;border:1px solid #fecaca">
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
</div></body></html>`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? `LifeLink <${user}>`,
      to: p.to,
      subject: `${p.urgency} — ${p.bloodType} blood needed at ${p.hospitalName}`,
      html,
    });
    return { sent: true as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[gmail-smtp] failed for ${p.to}:`, msg);
    return { sent: false as const, reason: `Gmail SMTP error: ${msg.slice(0, 300)}` };
  }
};
