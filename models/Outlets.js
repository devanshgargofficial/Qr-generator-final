const mongoose = require('mongoose');

// Maps the existing `outlets` collection in MongoDB.
// Field names are snake_case to match the stored documents exactly —
// do NOT rename them or Mongoose will stop mapping the DB fields.
const outletSchema = new mongoose.Schema({
    outlet_id: { type: String, required: true, unique: true },
    outlet_name: { type: String, required: true },
    outlet_category: { type: String },
    outlet_icon: { type: String },
    description: { type: String },
    outlet_profile_rules_and_regulation: { type: String },

    // Contact / links
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    google_url: { type: String },
    facebook_url: { type: String },
    instragram_url: { type: String }, // NOTE: misspelled in the DB; kept to match.
    map: { type: String },
    intro_video: { type: String },

    // Location & hours
    address: { type: String },
    opening_time: { type: String },
    closing_time: { type: String },

    // Business / legal
    gstin: { type: String },
    gst_percentage: { type: String },
    company_identification_number: { type: String },
    password: { type: String },

    // Flags & metrics
    nightcube_setup: { type: Boolean, default: false },
    authentication_status: { type: Boolean, default: false },
    promote: { type: Boolean, default: false },
    rating: { type: Number },

    // Relations — element type unknown from the field inventory (likely artist refs/objects).
    linked_artists: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, {
    collection: 'outlets',  // bind to the existing collection explicitly
    timestamps: true,       // manages createdAt / updatedAt automatically
});

module.exports = mongoose.model('Outlet', outletSchema);
