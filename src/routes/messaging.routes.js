const express = require('express');
const router  = express.Router();

const {
  getOrCreateConversation,
  getMesConversations,
  getMessages,
  createAppointment,
  updateAppointment,
} = require('../controllers/messaging.controller');

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/conversations',              authMiddleware, getOrCreateConversation);
router.get('/conversations',               authMiddleware, getMesConversations);
router.get('/messages/:conversationId',    authMiddleware, getMessages);
router.post('/appointments',               authMiddleware, createAppointment);
router.put('/appointments/:id',            authMiddleware, updateAppointment);

module.exports = router;