const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const Appointment  = require('../models/Appointment');

// ─── CRÉER OU RÉCUPÉRER UNE CONVERSATION ──────────────
// Si une conversation existe déjà entre ce client,
// ce promoteur et ce projet, on la retourne.
// Sinon on en crée une nouvelle.
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { promoteurId, projetId } = req.body;
    const clientId = req.user._id;

    let conversation = await Conversation.findOne({
      clientId,
      promoteurId,
      projetId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        clientId,
        promoteurId,
        projetId,
      });
    }

    res.json(conversation);
  } catch (erreur) {
    next(erreur);
  }
};

// ─── MES CONVERSATIONS ─────────────────────────────────
// Retourne toutes les conversations de l'utilisateur connecté.
// Filtre selon son rôle : client ou promoteur.
exports.getMesConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role   = req.user.role;

    const filtre = role === 'client'
      ? { clientId: userId }
      : { promoteurId: userId };

    const conversations = await Conversation.find(filtre)
      .populate('clientId',    'nom email')
      .populate('promoteurId', 'nom email')
      .populate('projetId',    'titre ville')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (erreur) {
    next(erreur);
  }
};

// ─── HISTORIQUE DES MESSAGES ───────────────────────────
// Chargé une seule fois quand le chat s'ouvre.
// Ensuite Socket.IO prend le relais pour les nouveaux messages.
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .sort({ sentAt: 1 }); // Du plus ancien au plus récent

    res.json(messages);
  } catch (erreur) {
    next(erreur);
  }
};

// ─── PROPOSER UN RENDEZ-VOUS ───────────────────────────
// Crée le rendez-vous ET envoie un message automatique
// dans la conversation pour informer l'autre personne.
exports.createAppointment = async (req, res, next) => {
  try {
    const { conversationId, date, note } = req.body;

    // Récupère io depuis app (on va le configurer dans server.js)
    const io = req.app.get('io');

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable.' });
    }

    // Crée le rendez-vous
    const rendezVous = await Appointment.create({
      conversationId,
      proposePar: req.user._id,
      date,
      note,
    });

    // Génère le message automatique
    const dateFormatee = new Date(date).toLocaleString('fr-FR');
    const contenuAuto  = `📢 [RENDEZ-VOUS PLANIFIÉ]\nUn rendez-vous a été fixé le ${dateFormatee}.\n📝 Notes : ${note || 'Aucune'}`;
    const senderModel  = req.user.role === 'client' ? 'Client' : 'Promoter';

    const messageAuto = await Message.create({
      conversationId,
      content:     contenuAuto,
      senderId:    req.user._id,
      senderModel: senderModel,
    });

    // Met à jour lastMessageAt
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Pousse le message en temps réel vers la room
    io.to(conversationId).emit('receive_message', messageAuto);

    res.status(201).json({ rendezVous, messageAuto });
  } catch (erreur) {
    next(erreur);
  }
};

// ─── CONFIRMER OU ANNULER UN RENDEZ-VOUS ──────────────
exports.updateAppointment = async (req, res, next) => {
  try {
    const { statut } = req.body;

    const rendezVous = await Appointment.findById(req.params.id);
    if (!rendezVous) {
      return res.status(404).json({ message: 'Rendez-vous introuvable.' });
    }

    // On ne peut pas confirmer son propre rendez-vous
    if (rendezVous.proposePar.toString() === req.user._id.toString()) {
      return res.status(403).json({
        message: 'Vous ne pouvez pas confirmer votre propre rendez-vous.',
      });
    }

    rendezVous.statut = statut;
    await rendezVous.save();

    res.json(rendezVous);
  } catch (erreur) {
    next(erreur);
  }
};