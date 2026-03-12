export function resetPasswordTemplate(resetURL: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#111;padding:32px 40px;border-bottom:1px solid #222;">
              <p style="margin:0;color:#555;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Security Alert</p>
              <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:400;letter-spacing:2px;">Password Reset</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 32px;color:#888;font-size:14px;line-height:1.8;letter-spacing:0.5px;">
                We received a request to reset your password. Click the button below to proceed. This link expires in <span style="color:#fff;">10 minutes</span>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetURL}" style="display:inline-block;background:#fff;color:#0f0f0f;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:16px 40px;border-radius:2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:32px 0 8px;color:#555;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Or copy this link:</p>
              <p style="margin:0;background:#0f0f0f;border:1px solid #333;border-radius:4px;padding:12px 16px;color:#666;font-size:11px;word-break:break-all;letter-spacing:0.5px;">
                ${resetURL}
              </p>

              <p style="margin:32px 0 0;color:#555;font-size:12px;line-height:1.8;letter-spacing:0.5px;">
                If you did not request a password reset, ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #222;background:#111;">
              <p style="margin:0;color:#444;font-size:11px;letter-spacing:1px;">This is an automated message. Please do not reply.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}