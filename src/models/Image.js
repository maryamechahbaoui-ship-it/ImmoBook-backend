const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  projetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: 'Image projet',
  },
  ordre: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Image', imageSchema);