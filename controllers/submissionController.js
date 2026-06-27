const tokens     = require('../services/tokenService');
const Outlet     = require('../models/Outlets');
const Submission = require('../models/Submission');

async function create(req, res) {
  try {
    const { ref, outlet_name } = req.body;

    // The outlet id comes from the verified token, NOT from the client body,
    // so a submission can't be pinned to an outlet the caller wasn't given.
    const outletId = tokens.verify(ref);
    if (!outletId) {
      return res.status(400).json({ success: false, error: 'Invalid or missing token.' });
    }

    const outlet = await Outlet.findOne({ outlet_id: outletId }, { outlet_id: 1, outlet_name: 1 });
    if (!outlet) {
      return res.status(404).json({ success: false, error: 'Outlet not found.' });
    }

    const submission = await Submission.create({
      outlet_id:   outlet.outlet_id,
      outlet_name: outlet_name || outlet.outlet_name,
    });

    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { create };
