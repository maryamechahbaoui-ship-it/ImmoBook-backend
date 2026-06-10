const Project     = require('../models/Project');
const Reservation = require('../models/Reservation');
const Review      = require('../models/Review');

// ─── DASHBOARD PRINCIPAL DU PROMOTEUR ─────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const promoteurId = req.user._id;

    // 1. Récupère tous les projets du promoteur
    const projets = await Project.find({ promoteurId });
    const projetIds = projets.map(p => p._id);

    // 2. Métriques globales
    const totalProjets    = projets.length;
    const totalVues       = projets.reduce((acc, p) => acc + p.vues, 0);
    const noteMoyenne     = projets.reduce((acc, p) => acc + p.noteMoyenne, 0) / (totalProjets || 1);

    // 3. Réservations sur tous ses projets
    const totalReservations = await Reservation.countDocuments({
      projetId: { $in: projetIds },
    });

    const reservationsConfirmees = await Reservation.countDocuments({
      projetId: { $in: projetIds },
      statut: 'confirme',
    });

    // 4. Taux de conversion = réservations confirmées / vues totales
    const tauxConversion = totalVues > 0
      ? ((reservationsConfirmees / totalVues) * 100).toFixed(1)
      : 0;

    // 5. Réservations par projet (top 5)
    const reservationsParProjet = await Reservation.aggregate([
      { $match: { projetId: { $in: projetIds } } },
      { $group: { _id: '$projetId', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'projet',
        },
      },
      { $unwind: '$projet' },
      {
        $project: {
          titre: '$projet.titre',
          ville:  '$projet.ville',
          total:  1,
        },
      },
    ]);

    // 6. Vues par projet (top 5)
    const vuesParProjet = projets
      .sort((a, b) => b.vues - a.vues)
      .slice(0, 5)
      .map(p => ({ titre: p.titre, ville: p.ville, vues: p.vues }));

    // 7. Répartition des statuts
    const statutsRepartition = {
      en_cours: projets.filter(p => p.statut === 'en_cours').length,
      livre:    projets.filter(p => p.statut === 'livre').length,
      vendu:    projets.filter(p => p.statut === 'vendu').length,
    };

    // 8. Dernières réservations (5 plus récentes)
    const dernieresReservations = await Reservation.find({
      projetId: { $in: projetIds },
    })
      .populate('clientId',  'nom email')
      .populate('projetId',  'titre ville')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      metriques: {
        totalProjets,
        totalVues,
        totalReservations,
        reservationsConfirmees,
        tauxConversion: Number(tauxConversion),
        noteMoyenne: Math.round(noteMoyenne * 10) / 10,
      },
      reservationsParProjet,
      vuesParProjet,
      statutsRepartition,
      dernieresReservations,
    });

  } catch (erreur) {
    next(erreur);
  }
};

// ─── STATISTIQUES D'UN PROJET SPÉCIFIQUE ──────────────
exports.getStatsProjet = async (req, res, next) => {
  try {
    const { projetId } = req.params;
    const promoteurId  = req.user._id;

    // Vérifie que le projet appartient au promoteur
    const projet = await Project.findOne({ _id: projetId, promoteurId });
    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable ou accès non autorisé.' });
    }

    // Réservations de ce projet
    const reservations = await Reservation.find({ projetId })
      .populate('clientId', 'nom email')
      .sort({ createdAt: -1 });

    const totalReservations      = reservations.length;
    const reservationsConfirmees = reservations.filter(r => r.statut === 'confirme').length;
    const reservationsAnnulees   = reservations.filter(r => r.statut === 'annule').length;
    const reservationsEnAttente  = reservations.filter(r => r.statut === 'en_attente').length;

    // Avis de ce projet
    const avis = await Review.find({ projetId })
      .populate('clientId', 'nom')
      .sort({ createdAt: -1 });

    res.json({
      projet: {
        titre:        projet.titre,
        ville:        projet.ville,
        prix:         projet.prix,
        statut:       projet.statut,
        vues:         projet.vues,
        noteMoyenne:  projet.noteMoyenne,
        nbAvis:       projet.nbAvis,
      },
      reservations: {
        total:       totalReservations,
        confirmees:  reservationsConfirmees,
        annulees:    reservationsAnnulees,
        enAttente:   reservationsEnAttente,
        liste:       reservations,
      },
      avis,
    });

  } catch (erreur) {
    next(erreur);
  }
};