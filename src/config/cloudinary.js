const cloudinary = require('cloudinary').v2; //C'est la bibliothèque de code qui permet de parler et de donner des ordres à mon compte Cloudinary (comme uploader, supprimer ou modifier une image). Le .v2 signifie simplement qu'on utilise la version 2, plus moderne, de leur outil.
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer'); //Multer est un package incontournable en Node.js. Par défaut, Express est incapable de lire des fichiers (images, PDF, vidéos) envoyés dans une requête HTTP; il ne comprend que le texte brut ou le JSON. Multer est le spécialiste qui sait ouvrir, lire et découper les fichiers reçus.
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'immobook/projects',
    allowed_formats: ['jpg', 'png', 'webp'],
  },
});

const upload = multer({ storage, limits: { files: 10 } });

module.exports = { cloudinary, upload };