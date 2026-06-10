const express = require('express');
const router  = express.Router();

const {
  getClientDashboard,
  getMesVisites,
} = require('../controllers/clientDashboard.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/',        authMiddleware, roleMiddleware('client'), getClientDashboard);
router.get('/visites', authMiddleware, roleMiddleware('client'), getMesVisites);

module.exports = router;