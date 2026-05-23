const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    promoteurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ['appartement', 'villa', 'bureau', 'local'],
      required: true,
    },
    prix: {
      type: Number,
      required: true,
    },
    statut: {
      type: String,
      enum: ['en_cours', 'livre', 'vendu'],
      default: 'en_cours',
    },
    ville: {
      type: String,
      required: true,
    },
    adresse: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    surface: {
      type: Number,
    },
    nbChambres: {
      type: Number,
    },
    nbSallesDeBain: {
      type: Number,
    },
    equipements: {
      type: [String],
    },
    dateDebut: {
      type: Date,
    },
    dateFinPrevue: {
      type: Date,
    },
    noteMoyenne: {
      type: Number,
      default: 0,
    },
    nbAvis: {
      type: Number,
      default: 0,
    },
    vues: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ ville: 1, prix: 1, surface: 1 });
// crée un index sur ces trois champs. 
// Le 1 veut dire "ordre croissant". 
// Sans cet index, chaque recherche filtrée par 
// ville+prix+surface parcourerait tous les projets un par un. 
// Avec l'index, c'est instantané même avec des milliers de projets.

module.exports = mongoose.model('Project', projectSchema);