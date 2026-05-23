const mongoose = require('mongoose');

const userSchema = new mongoose.Schema( // on definit shema ( la forme obligatoire) de users
  {
    nom: {
      type: String,
      required: true,// Si tu essaies de créer un utilisateur sans nom, Mongoose refuse et retourne une erreur.
      trim: true, //supprime les espaces au début et à la fin automatiquement.
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    motDePasseHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['client', 'promoteur', 'admin'],
      default: 'client',
    },
    emailVerifie: {
      type: Boolean,
      default: false,
    },
    codeVerification: {
      type: String,
    },
    codeVerificationExpire: {
      type: Date,
    },
    typeCompte: {
      type: String,
      enum: ['particulier', 'entreprise'],
      default: 'particulier',
    },
    nomEntreprise: {
      type: String,
    },
    numeroRC: {
      type: String,
    },
  },
  {
    timestamps: true, //ajoute automatiquement deux champs 
    // à chaque document : createdAt (date de création) et updatedAt (date de dernière modification).
  }
);

module.exports = mongoose.model('User', userSchema);

//on crée le modèle à partir du schéma et on l'exporte. 
// Le premier argument 'User' est le nom de la collection 
// dans MongoDB — Mongoose va automatiquement créer 
// une collection appelée users (minuscule + pluriel).