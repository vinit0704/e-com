const Newsletter = require('../models/Newsletter.model')
const { sendBulkEmail } = require('../utils/sendEmail')
const { newsletterTemplate } = require('../utils/emailTemplates')

exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Email required' })

    await Newsletter.findOneAndUpdate(
      { email },
      { email, isActive: true },
      { upsert: true, new: true }
    )
    res.json({ success: true, message: 'Subscribed successfully!' })
  } catch (err) { next(err) }
}

exports.unsubscribe = async (req, res, next) => {
  try {
    await Newsletter.findOneAndUpdate({ email: req.params.email }, { isActive: false })
    res.json({ success: true, message: 'Unsubscribed successfully' })
  } catch (err) { next(err) }
}

exports.getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 })
    res.json({ success: true, count: subscribers.length, subscribers })
  } catch (err) { next(err) }
}

exports.sendNewsletter = async (req, res, next) => {
  try {
    const { subject, content } = req.body
    if (!subject || !content) return res.status(400).json({ success: false, message: 'Subject and content required' })

    const subscribers = await Newsletter.find({ isActive: true }).select('email')
    const emails = subscribers.map(s => s.email)

    if (!emails.length) return res.status(400).json({ success: false, message: 'No active subscribers' })

    const result = await sendBulkEmail(emails, subject, newsletterTemplate(subject, content))
    res.json({ success: true, message: `Newsletter sent to ${result.sent} subscribers`, ...result })
  } catch (err) { next(err) }
}