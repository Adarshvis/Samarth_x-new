import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.netcorecloud.net',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USERNAME || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  })
}

const senderEmail = process.env.SMTP_SENDER_EMAIL || 'cps@uod.ac.in'
const FROM = `SamarthX <${senderEmail}>`

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Your SamarthX Verification Code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#1e3a5f;margin:0 0 16px;">Email Verification</h2>
        <p style="color:#334155;margin:0 0 24px;">Use the code below to verify your SamarthX account. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#1e3a5f;color:#fff;font-size:2rem;font-weight:700;letter-spacing:0.3em;text-align:center;padding:20px 32px;border-radius:8px;">
          ${otp}
        </div>
        <p style="color:#64748b;font-size:0.85rem;margin-top:24px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  })
}

export async function sendResetEmail(to: string, resetUrl: string): Promise<void> {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Reset Your SamarthX Password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#1e3a5f;margin:0 0 16px;">Password Reset Request</h2>
        <p style="color:#334155;margin:0 0 24px;">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" target="_self" style="display:inline-block;background:#1e3a5f;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;">Reset Password</a>
        <p style="color:#64748b;font-size:0.85rem;margin-top:24px;">Or copy this URL: ${resetUrl}</p>
        <p style="color:#64748b;font-size:0.85rem;margin-top:8px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  })
}
