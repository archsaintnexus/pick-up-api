export function updatePasswordTemplate(email: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Updated</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#111;padding:32px 40px;border-bottom:1px solid #222;">
              <p style="margin:0;color:#555;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Account Security</p>
              <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:400;letter-spacing:2px;">Password Updated</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <!-- Success Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center" style="background:#0f0f0f;border:1px solid #333;border-radius:4px;padding:24px;">
                    <p style="margin:0 0 6px;color:#555;font-size:10px;letter-spacing:4px;text-transform:uppercase;">Status</p>
                    <p style="margin:0;color:#4ade80;font-size:16px;font-weight:700;letter-spacing:4px;text-transform:uppercase;">&#10003; Successful</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#888;font-size:14px;line-height:1.8;letter-spacing:0.5px;">
                Hi <span style="color:#fff;">${email}</span>, your password has been successfully updated.
              </p>

              <p style="margin:0 0 32px;color:#888;font-size:14px;line-height:1.8;letter-spacing:0.5px;">
                If you made this change, no further action is needed. Your account is secure.
              </p>

              <p style="margin:0;color:#555;font-size:12px;line-height:1.8;letter-spacing:0.5px;">
                If you did not make this change, please contact support immediately as your account may be compromised.
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