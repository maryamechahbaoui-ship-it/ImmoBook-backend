const express = require('express');
const router  = express.Router();

const {
  addFavorite,
  removeFavorite,
  getMesFavoris,
  checkFavorite,
} = require('../controllers/favorites.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Toutes les routes favoris sont réservées aux clients
router.post('/',                authMiddleware, roleMiddleware('client'), addFavorite);
router.delete('/:projetId',     authMiddleware, roleMiddleware('client'), removeFavorite);
router.get('/',                 authMiddleware, roleMiddleware('client'), getMesFavoris);
router.get('/check/:projetId',  authMiddleware, roleMiddleware('client'), checkFavorite);

module.exports = router;