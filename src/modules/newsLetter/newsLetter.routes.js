const express = require('express');
const {
  subscribeNewsletter,
  broadcastNewsletter,
} = require('./newsLetter.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware'); // Assume this checks role

const router = express.Router();

router.post('/newsletter/subscribe', subscribeNewsletter);
router.post('/newsletter/broadcast', broadcastNewsletter);

module.exports = router;
