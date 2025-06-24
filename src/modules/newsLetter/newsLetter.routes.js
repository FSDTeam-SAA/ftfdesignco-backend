const express = require('express');
const {
  subscribeNewsletter,
  broadcastNewsletter,
} = require('./newsLetter.controller');

const router = express.Router();

router.post('/subscribe', subscribeNewsletter);
router.post('/broadcast', broadcastNewsletter);

module.exports = router;
