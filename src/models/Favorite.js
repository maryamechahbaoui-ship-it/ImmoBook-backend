const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  { timestamps: true }
);

// Index unique — un client ne peut pas mettre
// le même projet en favori deux fois
favoriteSchema.index({ clientId: 1, projetId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);