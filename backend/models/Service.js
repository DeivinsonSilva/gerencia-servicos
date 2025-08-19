// backend/models/Service.js
const mongoose = require('mongoose');
const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  active: { type: Boolean, default: true }
});
module.exports = mongoose.model('Service', ServiceSchema);