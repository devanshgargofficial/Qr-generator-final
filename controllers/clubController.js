const svc = require('../services/qrService');

async function getAllClubs(req, res) {
  try {
    const clubs = await svc.getAllClubs();
    res.json({ success: true, clubs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getClubByCode(req, res) {
  try {
    const club = await svc.getClubByCode(req.params.clubCode);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.json({ success: true, club });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllClubs, getClubByCode };
