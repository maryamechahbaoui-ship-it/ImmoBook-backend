const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // une seule fiche préférences par client
    },
    villes: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      enum: ['appartement', 'villa', 'bureau', 'local', ''],
      default: '',
    },
    budgetMax: {
      type: Number,
      default: 0,
    },
    alertEmail: {
      type: Boolean,
      default: true,
    },
    alertPush: {
      type: Boolean,
      default: false,
    },
    alertSMS: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Preference', preferenceSchema);