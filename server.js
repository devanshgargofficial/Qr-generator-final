require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');
const fs       = require('fs');

const app = express();
app.use(require('cors')());
app.use(express.json());
app.use(express.static('public'));

// ── MongoDB ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nerolifedb';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Ensure QR output directory exists ───────────────────────────────────────
const QR_DIR = path.join(__dirname, 'public', 'qr-codes');
if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true });

// ── Routes (order matters — /api/* before wildcard /:clubId) ─────────────────
app.use('/api/clubs',       require('./routes/clubs'));
app.use('/api/outlets',     require('./routes/outlets'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/otp',         require('./routes/otp'));
app.use('/api',             require('./routes/qr'));
app.use('/',          require('./routes/scan'));

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 QR images saved to: ${QR_DIR}`);
});
