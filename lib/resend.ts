import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Authflow <onboarding@resend.dev>'

const emailHtml = (content: string) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="background:#0B0F1A;margin:0;padding:40px 24px;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:480px;margin:0 auto;">
    <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;margin-bottom:32px;letter-spacing:-0.5px;">Authflow.</div>
    ${content}
  </div>
</body>
</html>`

export async function sendWaitlistConfirmation(email: string): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder_resend_key') return
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're on the Authflow waitlist",
      html: emailHtml(`
        <p style="font-size:16px;color:#ffffff;line-height:1.6;margin-bottom:24px;">You're on the list. We'll email you the moment we launch.</p>
        <p style="font-size:13px;color:#6B7A9A;">— The Authflow team</p>
      `),
    })
  } catch { /* silent fail */ }
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder_resend_key') return
  const greeting = name ? `Hi ${name},` : 'Welcome to Authflow.'
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Welcome to Authflow',
      html: emailHtml(`
        <p style="font-size:16px;color:#ffffff;line-height:1.6;margin-bottom:24px;">${greeting} Your free account is ready. You have 10 prior authorization requests to start.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/new" style="display:inline-block;background:#1B4FD8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Generate your first PA →</a>
      `),
    })
  } catch { /* silent fail */ }
}
