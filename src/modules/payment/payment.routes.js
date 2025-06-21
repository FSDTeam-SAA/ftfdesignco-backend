const express = require('express')
const {
  createPayment,
  confirmPayment,
} = require('./payment.controller')
const { protect } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/create-payment', protect, createPayment)
router.post('/confirm-payment', protect, confirmPayment)

module.exports = router
