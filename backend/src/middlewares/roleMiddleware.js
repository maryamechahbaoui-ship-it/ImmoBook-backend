const roleMiddleware = (...roles) => {
  return (req, res, next) => {

    // Vérifie que authMiddleware a bien été appelé avant
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié.' });
    }

    // Vérifie que le rôle de l'utilisateur est dans la liste autorisée
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({  //403 Forbidden → tu es connecté mais tu n'as pas le droit
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}.`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;