const QRRecord = require('../models/QRRecord');
const svc      = require('../services/qrService');

// ── Existing records ─────────────────────────────────────────────────────────

async function getAllRecords(req, res) {
  try {
    const records = await QRRecord.find({}).sort({ generatedAt: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getRecordByClub(req, res) {
  try {
    const record = await QRRecord.findOne({ clubId: req.params.clubId });
    if (!record) return res.json({ exists: false });
    res.json({ exists: true, record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── Existing generate (saves PNG to disk) ────────────────────────────────────

async function generate(req, res) {
  try {
    const { clubId, clubName, baseUrl } = req.body;
    if (!clubId || !clubName || !baseUrl) {
      return res.status(400).json({ success: false, error: 'clubId, clubName, and baseUrl are required.' });
    }
    const result = await svc.generateAndSave(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function generateAll(req, res) {
  try {
    const { clubs, baseUrl, fg, bg, size } = req.body;
    if (!clubs || !Array.isArray(clubs) || !baseUrl) {
      return res.status(400).json({ success: false, error: 'clubs array and baseUrl are required.' });
    }
    const results = [];
    for (const club of clubs) {
      const { record } = await svc.generateAndSave({
        clubId: club.id, clubName: club.name, emoji: club.emoji,
        baseUrl, fg, bg, size,
      });
      results.push(record);
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteRecord(req, res) {
  try {
    await svc.deleteRecord(req.params.clubId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── New: generate QR data URI from existing club (no disk write) ─────────────

async function generateQR(req, res) {
  try {
    const { clubId } = req.body;
    if (!clubId) {
      return res.status(400).json({ success: false, error: 'clubId is required.' });
    }
    const result = await svc.generateQRDataURI(clubId);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

// ── New: scan redirect ────────────────────────────────────────────────────────

async function scanRedirect(req, res) {
  try {
    const club = await QRRecord.findOne({ clubId: req.params.clubId });
    if (!club) return res.status(404).send('Club not found');
    res.redirect(club.targetUrl);
  } catch (err) {
    res.status(500).send('Server error');
  }
}

module.exports = { getAllRecords, getRecordByClub, generate, generateAll, deleteRecord, generateQR, scanRedirect };
