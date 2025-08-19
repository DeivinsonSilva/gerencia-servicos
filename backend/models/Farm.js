// backend/models/Farm.js
const mongoose = require('mongoose');
const FarmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  city: { type: String, required: true },
  active: { type: Boolean, default: true }
});
module.exports = mongoose.model('Farm', FarmSchema);