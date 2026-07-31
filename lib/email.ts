import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "QuantAI <onboarding@resend.dev>";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Sends a password-reset email containing a one-time link.
 * The link points to /reset-password?token=<token>.
 *
 * We catch and log errors here so callers never need to handle
 * Resend-specific exceptions — the route handler can stay clean.
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your QuantAI password</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:system-ui,-apple-system,sans-serif;color:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:48px auto;padding:0 16px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <span style="font-size:28px;color:#3b82f6;">◆</span>
              <span style="font-size:20px;font-weight:700;color:#f4f4f5;vertical-align:middle;margin-left:8px;">QuantAI</span>
            </td>
          </tr>
        </table>

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;">
          <tr>
            <td>
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f4f4f5;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#a1a1aa;line-height:1.6;">
                We received a request to reset the password for your QuantAI account.
                Click the button below to choose a new password. This link expires in
                <strong style="color:#f4f4f5;">1 hour</strong>.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border-radius:8px;background:#3b82f6;">
                    <a href="${resetUrl}"
                      style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;border-radius:8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#71717a;line-height:1.6;">
                If the button doesn't work, copy and paste this URL into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:12px;color:#3b82f6;word-break:break-all;">
                ${resetUrl}
              </p>

              <hr style="border:none;border-top:1px solid #27272a;margin:0 0 24px;" />

              <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <p style="text-align:center;font-size:12px;color:#52525b;margin-top:24px;">
          © ${new Date().getFullYear()} QuantAI · Automated Trading Platform
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Reset your QuantAI password",
    html,
  });

  if (error) {
    console.error("[email] Failed to send reset email:", error);
    throw new Error("Email delivery failed");
  }
}
