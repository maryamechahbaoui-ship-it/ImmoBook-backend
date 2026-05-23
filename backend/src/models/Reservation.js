const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
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
    statut: {
      type: String,
      enum: ['en_attente', 'confirme', 'annule'],
      default: 'en_attente',
    },
    acompte: {
      type: Number,
    },
    dateReservation: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reservation', reservationSchema);