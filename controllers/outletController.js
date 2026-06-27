const svc    = require('../services/outletService');
const tokens = require('../services/tokenService');
const Outlet = require('../models/Outlets');

async function getAllOutlets(req, res) {
  try {
    const outlets = await svc.getAllOutlets();
    res.json({ success: true, outlets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Mint a signed token for an outlet. The QR encodes a URL carrying this token
// instead of the raw outlet id, so the id never appears in the link.
async function createQRToken(req, res) {
  try {
    const { outletId } = req.body;
    if (!outletId) {
      return res.status(400).json({ success: false, error: 'outletId is required.' });
    }
    const outlet = await Outlet.findOne({ outlet_id: outletId }, { outlet_id: 1 });
    if (!outlet) {
      return res.status(404).json({ success: false, error: 'Outlet not found.' });
    }
    res.json({ success: true, token: tokens.sign(outlet.outlet_id) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Resolve a token back to the outlet's (non-sensitive) identity for the form.
async function resolveToken(req, res) {
  try {
    const outletId = tokens.verify(req.query.ref);
    if (!outletId) {
      return res.status(400).json({ success: false, error: 'Invalid or missing token.' });
    }
    const outlet = await Outlet.findOne({ outlet_id: outletId }, { outlet_id: 1, outlet_name: 1 });
    if (!outlet) {
      return res.status(404).json({ success: false, error: 'Outlet not found.' });
    }
    res.json({ success: true, outlet: { outlet_id: outlet.outlet_id, outlet_name: outlet.outlet_name } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllOutlets, createQRToken, resolveToken };
