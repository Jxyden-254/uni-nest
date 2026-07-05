// Email sending helper.
// If SMTP settings are provided in .env, real emails are sent with Nodemailer.
// Otherwise (local development) the email is printed to the console instead.
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: EmailOptions): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  if (!SMTP_HOST) {
    // Development fallback: log the email so links can be copied from the terminal.
    console.log("---- EMAIL (dev mode, not sent) ----");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log("------------------------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from: EMAIL_FROM || "UNI-NEST <no-reply@uninest.com>",
    to,
    subject,
    text,
  });
}
