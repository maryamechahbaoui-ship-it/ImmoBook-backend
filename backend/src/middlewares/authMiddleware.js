const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Cherche le token dans le header de la requête
    const authHeader = req.headers.authorization;

    // 2. Vérifie que le header existe et commence par "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    // 3. Extrait le token (supprime le mot "Bearer " du début)
    const token = authHeader.split(' ')[1];

    // 4. Vérifie que le token est valide et non expiré
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Cherche l'utilisateur en base avec l'id contenu dans le token
    const user = await User.findById(decoded.id).select('-motDePasseHash');

    // 6. Vérifie que l'utilisateur existe toujours
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }

    // 7. Ajoute l'utilisateur à la requête pour les prochains middlewares
    req.user = user;

    // 8. Laisse passer vers le prochain middleware ou controller
    next();

  } catch (erreur) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

module.exports = authMiddleware; 