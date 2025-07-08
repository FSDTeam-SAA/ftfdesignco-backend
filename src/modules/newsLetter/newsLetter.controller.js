const Newsletters = require('./newsLetter.models')
const sendEmail = require('../../utils/sendEmail')

exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const existing = await Newsletters.findOne({ email })
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Already subscribed',
        data: existing,
      })
    }

    const subscriber = await Newsletters.create({ email })
    return res.status(201).json({
      success: true,
      message: 'Subscribed successfully',
      data: subscriber,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    })
  }
}

exports.broadcastNewsletter = async (req, res) => {
  try {
    const { subject, html } = req.body

    if (!subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'Subject and HTML content are required',
      })
    }

    const subscribers = await Newsletters.find()
    const emails = subscribers.map((s) => s.email)

    await Promise.all(emails.map((email) => sendEmail(email, subject, html)))

    return res.status(200).json({
      success: true,
      message: 'Email sent to all newsletter subscribers',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    })
  }
}
