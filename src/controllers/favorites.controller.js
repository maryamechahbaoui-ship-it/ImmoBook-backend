const Favorite = require('../models/Favorite');
const Project  = require('../models/Project');

// ─── AJOUTER AUX FAVORIS ──────────────────────────────
exports.addFavorite = async (req, res, next) => {
  try {
    const { projetId } = req.body;
    const clientId = req.user._id;

    // Vérifie que le projet existe
    const projet = await Project.findById(projetId);
    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // findOneAndUpdate avec upsert = crée si n'existe pas,
    // ne fait rien si existe déjà (pas d'erreur de doublon)
    await Favorite.findOneAndUpdate(
      { clientId, projetId },
      { clientId, projetId },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Ajouté aux favoris.' });
  } catch (erreur) {
    next(erreur);
  }
};

// ─── RETIRER DES FAVORIS ──────────────────────────────
exports.removeFavorite = async (req, res, next) => {
  try {
    const { projetId } = req.params;
    const clientId = req.user._id;

    await Favorite.findOneAndDelete({ clientId, projetId });

    res.json({ message: 'Retiré des favoris.' });
  } catch (erreur) {
    next(erreur);
  }
};

// ─── MES FAVORIS ──────────────────────────────────────
exports.getMesFavoris = async (req, res, next) => {
  try {
    const clientId = req.user._id;

    const favoris = await Favorite.find({ clientId })
      .populate({
        path: 'projetId',
        select: 'titre ville prix type surface nbChambres nbSallesDeBain statut noteMoyenne vues promoteurId',
        populate: { path: 'promoteurId', select: 'nom email' },
      })
      .sort({ createdAt: -1 });

    // Récupère aussi les images pour chaque projet
    const Image = require('../models/Image');
    const result = await Promise.all(
      favoris.map(async (fav) => {
        if (!fav.projetId) return null;
        const images = await Image.find({ projetId: fav.projetId._id })
          .sort({ ordre: 1 })
          .limit(1);
        return {
          _id: fav._id,
          projetId: {
            ...fav.projetId.toObject(),
            images,
          },
          createdAt: fav.createdAt,
        };
      })
    );

    res.json(result.filter(Boolean));
  } catch (erreur) {
    next(erreur);
  }
};

// ─── VÉRIFIER SI UN PROJET EST EN FAVORI ──────────────
exports.checkFavorite = async (req, res, next) => {
  try {
    const { projetId } = req.params;
    const clientId = req.user._id;

    const fav = await Favorite.findOne({ clientId, projetId });

    res.json({ isFavorite: !!fav });
  } catch (erreur) {
    next(erreur);
  }
};