const Reservation = require('../models/Reservation');
const Project = require('../models/Project');

// ─── CRÉER UNE RÉSERVATION ─────────────────────────────
exports.createReservation = async (req, res, next) => {
  try {
    const { projetId, acompte } = req.body;

    // 1. Vérifie que le projet existe
    const projet = await Project.findById(projetId);
    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // 2. Vérifie que le projet est disponible
    if (projet.statut === 'vendu') {
      return res.status(400).json({ message: 'Ce bien est déjà vendu.' });
    }

    // 3. Vérifie que le client n'a pas déjà réservé ce projet
    const dejaReserve = await Reservation.findOne({
      clientId: req.user._id,
      projetId,
      statut: { $ne: 'annule' },
    });
    if (dejaReserve) {
      return res.status(400).json({ message: 'Vous avez déjà réservé ce bien.' });
    }

    // 4. Crée la réservation
    const reservation = await Reservation.create({
      clientId: req.user._id,
      projetId,
      acompte,
    });

    res.status(201).json(reservation);

  } catch (erreur) {
    next(erreur);
  }
};

// ─── MES RÉSERVATIONS ──────────────────────────────────
exports.getMesReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ clientId: req.user._id })
      .populate('projetId', 'titre ville prix statut')
      .sort({ createdAt: -1 });

    res.json(reservations);

  } catch (erreur) {
    next(erreur);
  }
};

// ─── ANNULER UNE RÉSERVATION ───────────────────────────
exports.annulerReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation introuvable.' });
    }

    // Vérifie que c'est bien le propriétaire de la réservation
    if (reservation.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    // Vérifie que la réservation n'est pas déjà annulée
    if (reservation.statut === 'annule') {
      return res.status(400).json({ message: 'Réservation déjà annulée.' });
    }

    reservation.statut = 'annule';
    await reservation.save();

    res.json({ message: 'Réservation annulée avec succès.' });

  } catch (erreur) {
    next(erreur);
  }
};

// ─── RÉSERVATIONS D'UN PROJET (promoteur) ─────────────
exports.getReservationsProjet = async (req, res, next) => {
  try {
    const projet = await Project.findById(req.params.projetId);

    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // Vérifie que c'est bien le promoteur du projet
    if (projet.promoteurId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    const reservations = await Reservation.find({ projetId: req.params.projetId })
      .populate('clientId', 'nom email')
      .sort({ createdAt: -1 });

    res.json(reservations);

  } catch (erreur) {
    next(erreur);
  }
};