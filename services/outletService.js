const Outlet = require('../models/Outlets');

// Lightweight list for the dropdown — only the fields the UI needs.
// Sorted by name so the dropdown is easy to scan.
async function getAllOutlets() {
  return Outlet.find(
    {},
    { outlet_id: 1, outlet_name: 1, outlet_icon: 1, website: 1, google_url: 1, map: 1 }
  ).sort({ outlet_name: 1 });
}

module.exports = { getAllOutlets };
