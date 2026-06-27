const mongoose = require('mongoose');

const qrSchema = new mongoose.Schema({
  clubId:      { type: String, required: true, unique: true },
  clubName:    { type: String, required: true },
  emoji:       { type: String, default: '🎵' },
  imagePath:   { type: String, required: true },
  targetUrl:   { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('QRRecord', qrSchema);
