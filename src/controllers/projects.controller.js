const Project = require('../models/Project');
const Image = require('../models/Image');

// ─── GET TOUS LES PROJETS (avec filtres + pagination) ──
exports.getProjects = async (req, res, next) => {
  try {
    const {
      ville, type, statut,
      prixMin, prixMax,
      surfaceMin, surfaceMax,
      page = 1, limit = 12,
    } = req.query;

    // Construction du filtre dynamiquement
    const filtre = {};
    if (ville)      filtre.ville = new RegExp(ville, 'i');
    if (type)       filtre.type = type;
    if (statut)     filtre.statut = statut;
    if (prixMin || prixMax) {
      filtre.prix = {};
      if (prixMin) filtre.prix.$gte = Number(prixMin);
      if (prixMax) filtre.prix.$lte = Number(prixMax);
    }
    if (surfaceMin || surfaceMax) {
      filtre.surface = {};
      if (surfaceMin) filtre.surface.$gte = Number(surfaceMin);
      if (surfaceMax) filtre.surface.$lte = Number(surfaceMax);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [projets, total] = await Promise.all([
      Project.find(filtre)
        .populate('promoteurId', 'nom email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Project.countDocuments(filtre),
    ]);

    res.json({
      projets,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });

  } catch (erreur) {
    next(erreur);
  }
};

// ─── GET UN PROJET PAR ID ──────────────────────────────
exports.getProjectById = async (req, res, next) => {
  try {
    const projet = await Project.findById(req.params.id)
      .populate('promoteurId', 'nom email');

    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // Incrémente le compteur de vues
    projet.vues += 1;
    await projet.save();

    // Récupère les images du projet
    const images = await Image.find({ projetId: projet._id }).sort({ ordre: 1 });

    res.json({ ...projet.toObject(), images });

  } catch (erreur) {
    next(erreur);
  }
};

// ─── CRÉER UN PROJET ───────────────────────────────────
exports.createProject = async (req, res, next) => {
  try {
    const projet = await Project.create({
      ...req.body,
      promoteurId: req.user._id,
    });

    res.status(201).json(projet);

  } catch (erreur) {
    next(erreur);
  }
};

// ─── MODIFIER UN PROJET ────────────────────────────────
exports.updateProject = async (req, res, next) => {
  try {
    const projet = await Project.findById(req.params.id);

    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    // Vérifie que c'est bien le propriétaire
    if (projet.promoteurId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    const projetMisAJour = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(projetMisAJour);

  } catch (erreur) {
    next(erreur);
  }
};

// ─── SUPPRIMER UN PROJET ───────────────────────────────
exports.deleteProject = async (req, res, next) => {
  try {
    const projet = await Project.findById(req.params.id);

    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable.' });
    }

    if (projet.promoteurId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    await Project.findByIdAndDelete(req.params.id);
    await Image.deleteMany({ projetId: req.params.id });

    res.json({ message: 'Projet supprimé avec succès.' });

  } catch (erreur) {
    next(erreur);
  }
};

// ─── UPLOAD IMAGES ─────────────────────────────────────
exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucune image reçue.' });
    }

    const images = await Promise.all(
      req.files.map((file, index) =>
        Image.create({
          projetId: req.params.id,
          url: file.path,
          alt: `Image ${index + 1}`,
          ordre: index,
        })
      )
    );

    res.status(201).json(images);

  } catch (erreur) {
    next(erreur);
  }
};