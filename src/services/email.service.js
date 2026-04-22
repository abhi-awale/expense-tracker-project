const { Resend } = require('resend');
const env = require('../config/env');

const isEmailConfigured = () => Boolean(env.resend.apiKey && env.resend.fromEmail);

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  if (!isEmailConfigured()) {
    return { sent: false, reason: 'Email service is not configured.' };
  }

  const resend = new Resend(env.resend.apiKey);
  console.log(to);
  const { error } = await resend.emails.send({
    from: 'ExpensePilot <onboarding@resend.dev>',
    to,
    subject: 'Reset your ExpensePilot password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #2f4156;">
        <div style="background: linear-gradient(135deg, #123458, #214b73); border-radius: 20px; padding: 24px; color: #ffffff;">
          <div style="font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: #f0c394;">ExpensePilot</div>
          <h1 style="margin: 12px 0 0; font-size: 28px;">Reset your password</h1>
          <p style="margin: 12px 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.82);">
            A password reset was requested for your account.
          </p>
        </div>
        <div style="background: #ffffff; border: 1px solid rgba(18, 52, 88, 0.1); border-radius: 20px; margin-top: 20px; padding: 24px;">
          <p style="margin-top: 0;">Hi ${name || 'there'},</p>
          <p>
            Click the button below to choose a new password for your ExpensePilot account. This reset link expires in 30 minutes.
          </p>
          <p style="margin: 28px 0;">
            <a
              href="${resetUrl}"
              style="display: inline-block; background: #123458; color: #ffffff; text-decoration: none; padding: 14px 22px; border-radius: 999px; font-weight: 700;"
            >
              Reset password
            </a>
          </p>
          <p style="margin-bottom: 8px;">If the button does not work, use this link:</p>
          <p style="word-break: break-word; color: #123458;">${resetUrl}</p>
          <p style="margin-bottom: 0; color: #6b7280; font-size: 14px;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });

  console.log('email sent');
  if (error) {
    throw new Error(error.message || 'Unable to send reset password email.');
  }

  return { sent: true };
};

module.exports = {
  isEmailConfigured,
  sendPasswordResetEmail,
};
