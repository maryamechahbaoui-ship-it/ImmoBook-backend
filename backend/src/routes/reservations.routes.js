const express = require('express');
const router = express.Router();

const {
  createReservation,
  getMesReservations,
  annulerReservation,
  getReservationsProjet,
} = require('../controllers/reservations.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Client
router.post('/', authMiddleware, roleMiddleware('client'), createReservation);
router.get('/mes-reservations', authMiddleware, roleMiddleware('client'), getMesReservations);
router.put('/:id/annuler', authMiddleware, roleMiddleware('client'), annulerReservation);

// Promoteur
router.get('/projet/:projetId', authMiddleware, roleMiddleware('promoteur'), getReservationsProjet);

module.exports = router;