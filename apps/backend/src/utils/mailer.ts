import nodemailer from "nodemailer";
import { ENV } from "../config/env";

export const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: ENV.SMTP_PORT === 465,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  // Email notifikasi ke pemilik portfolio
  await transporter.sendMail({
    from: `"Portfolio Contact" <${ENV.SMTP_FROM}>`,
    to: ENV.SMTP_TO,
    replyTo: data.email,
    subject: `[Portfolio] ${data.subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b4c35; border-bottom: 2px solid #e8d5c4; padding-bottom: 8px;">
          Pesan Baru dari Portfolio
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; color: #666; width: 100px;"><strong>Nama</strong></td>
            <td style="padding: 8px; color: #333;">${data.name}</td>
          </tr>
          <tr style="background: #f9f5f1;">
            <td style="padding: 8px; color: #666;"><strong>Email</strong></td>
            <td style="padding: 8px; color: #333;">
              <a href="mailto:${data.email}" style="color: #6b4c35;">${data.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #666;"><strong>Subjek</strong></td>
            <td style="padding: 8px; color: #333;">${data.subject}</td>
          </tr>
        </table>
        <div style="background: #f9f5f1; padding: 16px; border-radius: 8px; margin-top: 8px;">
          <strong style="color: #666;">Pesan:</strong>
          <p style="color: #333; margin: 8px 0 0; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Dikirim pada ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
        </p>
      </div>
    `,
  });

  // Auto-reply ke pengirim
  await transporter.sendMail({
    from: `"Irma Iryani" <${ENV.SMTP_FROM}>`,
    to: data.email,
    subject: `Re: ${data.subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b4c35;">Terima kasih telah menghubungi saya!</h2>
        <p style="color: #333; line-height: 1.6;">
          Halo <strong>${data.name}</strong>,
        </p>
        <p style="color: #333; line-height: 1.6;">
          Pesan Anda telah saya terima. Saya akan segera merespons dalam 1–2 hari kerja.
        </p>
        <div style="background: #f9f5f1; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #6b4c35;">
          <strong style="color: #666;">Pesan Anda:</strong>
          <p style="color: #555; margin: 8px 0 0; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </div>
        <p style="color: #333; line-height: 1.6;">
          Salam,<br/>
          <strong>Irma Iryani</strong>
        </p>
      </div>
    `,
  });
}
