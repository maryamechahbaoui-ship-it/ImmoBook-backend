const Review = require('../models/Review');
const Project = require('../models/Project');
const Reservation = require('../models/Reservation');

// ─── POSTER UN AVIS ────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const { projetId, etoiles, commentaire } = req.body;

    // 1. Vérifie que le projet existe
    const projet = await Project.findById(projetId);
    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // 2. Vérifie que le client a bien réservé ce projet
    const reservation = await Reservation.findOne({
      clientId: req.user._id,
      projetId,
      statut: 'confirme',
    });
    if (!reservation) {
      return res.status(403).json({
        message: 'Vous devez avoir une réservation confirmée pour laisser un avis.',
      });
    }

    // 3. Vérifie qu'il n'a pas déjà laissé un avis
    const dejaNote = await Review.findOne({
      clientId: req.user._id,
      projetId,
    });
    if (dejaNote) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce projet.' });
    }

    // 4. Crée l'avis
    const avis = await Review.create({
      clientId: req.user._id,
      projetId,
      etoiles,
      commentaire,
    });

    // 5. Recalcule la note moyenne du projet
    const tousLesAvis = await Review.find({ projetId });
    const moyenne = tousLesAvis.reduce((acc, a) => acc + a.etoiles, 0) / tousLesAvis.length;

    await Project.findByIdAndUpdate(projetId, {
      noteMoyenne: Math.round(moyenne * 10) / 10,
      nbAvis: tousLesAvis.length,
    });

    res.status(201).json(avis);

  } catch (erreur) {
    next(erreur);
  }
};

// ─── AVIS D'UN PROJET ──────────────────────────────────
exports.getAvisProjet = async (req, res, next) => {
  try {
    const avis = await Review.find({ projetId: req.params.projetId })
      .populate('clientId', 'nom')
      .sort({ createdAt: -1 });

    res.json(avis);

  } catch (erreur) {
    next(erreur);
  }
};