const express = require('express');
const router = express.Router();

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  uploadImages,
} = require('../controllers/projects.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { upload } = require('../config/cloudinary');

// Routes publiques — tout le monde peut voir les projets
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Routes protégées — promoteur uniquement
router.post('/', authMiddleware, roleMiddleware('promoteur'), createProject);
router.put('/:id', authMiddleware, roleMiddleware('promoteur'), updateProject);
router.delete('/:id', authMiddleware, roleMiddleware('promoteur'), deleteProject);
router.post('/:id/images', authMiddleware, roleMiddleware('promoteur'), upload.array('images', 10), uploadImages);

module.exports = router;