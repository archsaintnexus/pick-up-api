export function resetPasswordConfirmTemplate(email: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
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

              <!-- Warning Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center" style="background:#0f0f0f;border:1px solid #f87171;border-radius:4px;padding:24px;">
                    <p style="margin:0 0 6px;color:#555;font-size:10px;letter-spacing:4px;text-transform:uppercase;">Alert</p>
                    <p style="margin:0;color:#f87171;font-size:16px;font-weight:700;letter-spacing:4px;text-transform:uppercase;">&#9888; Password Changed</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#888;font-size:14px;line-height:1.8;letter-spacing:0.5px;">
                The password for <span style="color:#fff;">${email}</span> was recently reset.
              </p>

              <p style="margin:0 0 32px;color:#888;font-size:14px;line-height:1.8;letter-spacing:0.5px;">
                If you initiated this reset, you can safely log in with your new password.
              </p>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#0f0f0f;border-left:3px solid #f87171;padding:16px 20px;border-radius:2px;">
                    <p style="margin:0;color:#f87171;font-size:12px;line-height:1.8;letter-spacing:0.5px;">
                      If you did NOT request this reset, contact support immediately. Your account may have been compromised.
                    </p>
                  </td>
                </tr>
              </table>

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