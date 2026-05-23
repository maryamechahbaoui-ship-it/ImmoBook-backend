const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./src/config/db');
const errorHandler  = require('./src/middlewares/errorHandler');
const authRoutes    = require('./src/routes/auth.routes');
const projectsRoutes = require('./src/routes/projects.routes');
const reservationsRoutes = require('./src/routes/reservations.routes');
const reviewsRoutes      = require('./src/routes/reviews.routes');

const app = express();
connectDB();

// Middlewares globaux
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'ImmoBook API opérationnelle' });
});


app.use('/api/v2/auth', authRoutes);
app.use('/api/v2/projects', projectsRoutes);
app.use('/api/v2/reservations', reservationsRoutes);
app.use('/api/v2/reviews', reviewsRoutes);

// Gestionnaire d'erreurs — toujours EN DERNIER
app.use(errorHandler);



// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});