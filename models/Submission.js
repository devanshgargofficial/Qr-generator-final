const mongoose = require('mongoose');

// Form submissions captured when someone opens an outlet's QR form.
// outlet_id is always taken from the verified token server-side — never
// trusted from client input — so submissions can't be forged onto another outlet.
const submissionSchema = new mongoose.Schema({
  outlet_id:      { type: String, required: true, index: true },
  outlet_name:    { type: String },
  // Person filling the form
  name:           { type: String },
  email:          { type: String },
  age:            { type: Number },
  email_verified: { type: Boolean, default: false },
}, {
  collection: 'submissions',
  timestamps: true,
});

module.exports = mongoose.model('Submission', submissionSchema);
