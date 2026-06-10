const Reservation  = require('../models/Reservation');
const Favorite     = require('../models/Favorite');
const Conversation = require('../models/Conversation');
const Appointment  = require('../models/Appointment');
const Message      = require('../models/Message');
const Image        = require('../models/Image');

// ─── DASHBOARD GLOBAL DU CLIENT ───────────────────────
exports.getClientDashboard = async (req, res, next) => {
  try {
    const clientId = req.user._id;

    // 1. Mes réservations
    const reservations = await Reservation.find({ clientId })
      .populate('projetId', 'titre ville prix type statut')
      .sort({ createdAt: -1 });

    const totalReservations     = reservations.length;
    const reservationsConfirmees = reservations.filter(r => r.statut === 'confirme').length;
    const reservationsEnAttente  = reservations.filter(r => r.statut === 'en_attente').length;

    // 2. Mes favoris
    const totalFavoris = await Favorite.countDocuments({ clientId });

    // 3. Mes conversations + messages non lus
    const conversations = await Conversation.find({ clientId })
      .populate('promoteurId', 'nom email')
      .populate('projetId', 'titre ville')
      .sort({ lastMessageAt: -1 });

    // Compte les messages non lus pour ce client
    const nonLus = await Message.countDocuments({
      conversationId: { $in: conversations.map(c => c._id) },
      senderId: { $ne: clientId },
      lu: false,
    });

    // 4. Prochains rendez-vous confirmés
    const prochainsRdv = await Appointment.find({
      conversationId: { $in: conversations.map(c => c._id) },
      statut: { $in: ['confirme', 'en_attente'] },
      date: { $gte: new Date() },
    })
      .populate('proposePar', 'nom email')
      .populate({
        path: 'conversationId',
        populate: [
          { path: 'projetId', select: 'titre ville' },
          { path: 'promoteurId', select: 'nom email' },
        ],
      })
      .sort({ date: 1 })
      .limit(5);

    res.json({
      metriques: {
        totalReservations,
        reservationsConfirmees,
        reservationsEnAttente,
        totalFavoris,
        messagesNonLus: nonLus,
        totalConversations: conversations.length,
      },
      dernieresReservations: reservations.slice(0, 5),
      prochainsRdv,
      conversations: conversations.slice(0, 5),
    });
  } catch (erreur) {
    next(erreur);
  }
};

// ─── MES VISITES (rendez-vous du client) ──────────────
exports.getMesVisites = async (req, res, next) => {
  try {
    const clientId = req.user._id;

    // Récupère toutes les conversations du client
    const conversations = await Conversation.find({ clientId });
    const convIds = conversations.map(c => c._id);

    // Récupère tous les rendez-vous liés à ces conversations
    const rendezVous = await Appointment.find({
      conversationId: { $in: convIds },
    })
      .populate('proposePar', 'nom email role')
      .populate({
        path: 'conversationId',
        populate: [
          { path: 'projetId', select: 'titre ville adresse' },
          { path: 'promoteurId', select: 'nom email' },
        ],
      })
      .sort({ date: 1 });

    // Sépare prochains et passés
    const maintenant = new Date();
    const prochains = rendezVous.filter(r => new Date(r.date) >= maintenant);
    const passes    = rendezVous.filter(r => new Date(r.date) < maintenant);

    res.json({ prochains, passes });
  } catch (erreur) {
    next(erreur);
  }
};