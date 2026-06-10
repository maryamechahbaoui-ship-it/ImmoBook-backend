const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB          = require('./src/config/db');
const errorHandler       = require('./src/middlewares/errorHandler');
const authRoutes         = require('./src/routes/auth.routes');
const projectsRoutes     = require('./src/routes/projects.routes');
const reservationsRoutes = require('./src/routes/reservations.routes');
const reviewsRoutes      = require('./src/routes/reviews.routes');
const messagingRoutes    = require('./src/routes/messaging.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes'); 
const favoritesRoutes       = require('./src/routes/favorites.routes');
const preferencesRoutes     = require('./src/routes/preferences.routes');
const clientDashboardRoutes = require('./src/routes/clientDashboard.routes');


const app = express();
connectDB();

// Middlewares globaux
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Routes HTTP
app.get('/', (req, res) => {
  res.json({ message: 'ImmoBook API opérationnelle' });
});
app.use('/api/v2/auth',         authRoutes);
app.use('/api/v2/projects',     projectsRoutes);
app.use('/api/v2/reservations', reservationsRoutes);
app.use('/api/v2/reviews',      reviewsRoutes);
app.use('/api/v2/messaging',    messagingRoutes);
app.use('/api/v2/dashboard', dashboardRoutes);
app.use('/api/v2/favorites',         favoritesRoutes);
app.use('/api/v2/preferences',       preferencesRoutes);
app.use('/api/v2/client/dashboard',  clientDashboardRoutes);

app.use(errorHandler);

// ─── SOCKET.IO ────────────────────────────────────────
// http.createServer(app) crée un serveur HTTP classique
// à partir d'Express. Socket.IO a besoin de ce serveur
// HTTP pour greffer sa connexion permanente dessus.
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Rend io accessible dans tous les controllers
// via req.app.get('io')
app.set('io', io);

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Utilisateur connecté via socket :', socket.id);

  // Le client rejoint la room de sa conversation
  // Chaque conversation est une room isolée
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} a rejoint la room ${conversationId}`);
  });

  // Réception d'un message via Socket
  socket.on('send_message', async (messageData) => {
    try {
      const Message      = require('./src/models/Message');
      const Conversation = require('./src/models/Conversation');

      // Sauvegarde en base de données
      const message = await Message.create({
        conversationId: messageData.conversationId,
        content:        messageData.content,
        senderId:       messageData.senderId,
        senderModel:    messageData.senderModel,
      });

      // Met à jour lastMessageAt
      await Conversation.findByIdAndUpdate(
        messageData.conversationId,
        { lastMessageAt: new Date() }
      );

      // Diffuse le message à tous dans la room
      io.to(messageData.conversationId).emit('receive_message', message);

    } catch (err) {
      console.error('Erreur socket send_message :', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté :', socket.id);
  });
});

// ─── DÉMARRAGE ────────────────────────────────────────
// On démarre httpServer (pas app.listen)
// car Socket.IO est greffé sur httpServer
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});