const ejs = require('ejs');
const path = require('path');
const { Resend } = require('resend');
const {resendApiKey} = require('../config/env.config');

const resend = new Resend(resendApiKey);

async function renderTemplate(templateName, data) {
  const filePath = path.join(__dirname, `../views/templates/${templateName}.ejs`);
  return await ejs.renderFile(filePath, data);
}

async function sendVerificationEmail(user, link) {
  const html = await renderTemplate('verify-email', {
    name: user.firstName,
    link
  });

  await resend.emails.send({
    from: 'Expense App <onboarding@resend.dev>', // change later to your domain
    to: user.email,
    subject: 'Verify your email',
    html,
    text: `Verify your email: ${link}` // fallback
  });
}

module.exports = {
  sendVerificationEmail
};