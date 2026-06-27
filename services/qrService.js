const QRCode   = require('qrcode');
const path     = require('path');
const fs       = require('fs');
const QRRecord = require('../models/QRRecord');

const QR_DIR = path.join(__dirname, '..', 'public', 'qr-codes');

// ── Club lookups ─────────────────────────────────────────────────────────────

async function getAllClubs() {
  return QRRecord.find({}, { clubName: 1, clubId: 1, imagePath: 1, targetUrl: 1 });
}

async function getClubByCode(clubCode) {
  return QRRecord.findOne({ clubId: clubCode });
}

// ── New: generate QR data URI from existing club record ──────────────────────
// Encodes only { clubId, clubName, targetUrl } — no DB fields.

async function generateQRDataURI(clubId) {
  const club = await QRRecord.findOne({ clubId });
  if (!club) {
    const err = new Error(`Club "${clubId}" not found`);
    err.statusCode = 404;
    throw err;
  }

  const payload = {
    clubId:    club.clubId,
    clubName:  club.clubName,
    targetUrl: club.targetUrl,
  };

  const qrImage = await QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
    color: { dark: '#000000', light: '#ffffff' },
  });

  return { qrImage, payload };
}

// ── Existing: generate PNG to disk + upsert DB ───────────────────────────────

async function generateAndSave({ clubId, clubName, emoji, baseUrl, fg, bg, size }) {
  const targetUrl = `${baseUrl.replace(/\/$/, '')}/${clubId}`;
  const filename  = `qr-${clubId}.png`;
  const filePath  = path.join(QR_DIR, filename);
  const imagePath = `/qr-codes/${filename}`;

  await QRCode.toFile(filePath, targetUrl, {
    width: parseInt(size) || 240,
    color: { dark: fg || '#000000', light: bg || '#ffffff' },
    errorCorrectionLevel: 'H',
    margin: 2,
  });

  const record = await QRRecord.findOneAndUpdate(
    { clubId },
    { clubId, clubName, emoji: emoji || '🎵', imagePath, targetUrl, updatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { record, imageUrl: imagePath };
}

// ── Existing: delete record + file ───────────────────────────────────────────

async function deleteRecord(clubId) {
  await QRRecord.deleteOne({ clubId });
  const filePath = path.join(QR_DIR, `qr-${clubId}.png`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

module.exports = { getAllClubs, getClubByCode, generateQRDataURI, generateAndSave, deleteRecord };
