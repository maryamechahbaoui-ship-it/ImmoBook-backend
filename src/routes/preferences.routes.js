const express = require('express');
const router  = express.Router();

const {
  getPreferences,
  savePreferences,
} = require('../controllers/preferences.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/',  authMiddleware, roleMiddleware('client'), getPreferences);
router.put('/',  authMiddleware, roleMiddleware('client'), savePreferences);

module.exports = router;