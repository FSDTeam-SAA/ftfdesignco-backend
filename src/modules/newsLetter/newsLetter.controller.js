const httpStatus = require('http-status');
const { Newsletter } = require('../models/newsLetter.models');
const  sendEmail  = require('../../utils/sendEmail');

exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Email is required',
      });
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(httpStatus.OK).json({
        success: true,
        message: 'Already subscribed',
        data: existing,
      });
    }

    const subscriber = await Newsletter.create({ email });
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Subscribed successfully',
      data: subscriber,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};

exports.broadcastNewsletter = async (req, res) => {
  try {
    const { subject, html } = req.body;

    if (!subject || !html) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Subject and HTML content are required',
      });
    }

    const subscribers = await Newsletter.find();
    const emails = subscribers.map((s) => s.email);

    await Promise.all(emails.map((email) => sendEmail(email, subject, html)));

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Email sent to all newsletter subscribers',
      data: {},
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};
