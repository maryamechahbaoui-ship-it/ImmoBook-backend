const express = require('express');
const router  = express.Router();

const {
  getDashboard,
  getStatsProjet,
} = require('../controllers/dashboard.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Toutes les routes dashboard sont réservées au promoteur
router.get('/', authMiddleware, roleMiddleware('promoteur'), getDashboard);
router.get('/projet/:projetId', authMiddleware, roleMiddleware('promoteur'), getStatsProjet);

module.exports = router;