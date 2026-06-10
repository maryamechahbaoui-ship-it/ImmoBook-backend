const Preference = require('../models/Preference');

// ─── RÉCUPÉRER MES PRÉFÉRENCES ────────────────────────
exports.getPreferences = async (req, res, next) => {
  try {
    const clientId = req.user._id;

    // findOneAndUpdate avec upsert crée les préférences
    // par défaut si le client n'en a pas encore
    const prefs = await Preference.findOneAndUpdate(
      { clientId },
      { $setOnInsert: { clientId } },
      { upsert: true, new: true }
    );

    res.json(prefs);
  } catch (erreur) {
    next(erreur);
  }
};

// ─── SAUVEGARDER MES PRÉFÉRENCES ─────────────────────
exports.savePreferences = async (req, res, next) => {
  try {
    const clientId = req.user._id;
    const {
      villes,
      type,
      budgetMax,
      alertEmail,
      alertPush,
      alertSMS,
    } = req.body;

    const prefs = await Preference.findOneAndUpdate(
      { clientId },
      {
        villes,
        type,
        budgetMax,
        alertEmail,
        alertPush,
        alertSMS,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: 'Préférences sauvegardées.', prefs });
  } catch (erreur) {
    next(erreur);
  }
};