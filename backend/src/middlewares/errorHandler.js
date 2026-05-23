const errorHandler = (err, req, res, next) => {

  // Affiche l'erreur dans la console pendant le développement
  console.error('ERREUR :', err.message);

  // Utilise le code d'erreur personnalisé ou 500 par défaut
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'Erreur serveur interne.',
  });
};

module.exports = errorHandler;