const transporter = require('../config/email')

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    console.log(`📧 Email sent to ${to}`)
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message)
    // Don't throw — email failure shouldn't break the main flow
  }
}

const sendBulkEmail = async (recipients, subject, html) => {
  const results = await Promise.allSettled(
    recipients.map(email => sendEmail({ to: email, subject, html }))
  )
  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  console.log(`📧 Bulk email: ${sent} sent, ${failed} failed`)
  return { sent, failed }
}

const emailVerifyTemplate = (url) => `
  <h2>Verify Your Email</h2>
  <p>Click the link below to verify your email. Expires in 24 hours.</p>
  <a href="${url}" style="background:#4f46e5;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">
    Verify Email
  </a>`

const passwordResetTemplate = (url) => `
  <h2>Reset Your Password</h2>
  <p>Click the link below to reset your password. Expires in 1 hour.</p>
  <a href="${url}" style="background:#dc2626;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">
    Reset Password
  </a>`

module.exports = {
  sendEmail,
  sendBulkEmail,
  emailVerifyTemplate,
  passwordResetTemplate,
}