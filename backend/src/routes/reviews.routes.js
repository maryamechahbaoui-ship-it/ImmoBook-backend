const express = require('express');
const router = express.Router();

const {
  createReview,
  getAvisProjet,
} = require('../controllers/reviews.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware('client'), createReview);
router.get('/projet/:projetId', getAvisProjet);

module.exports = router;