// backend/models/Worker.js
const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isRegistered: {
    type: Boolean,
    required: true
  },
  registrationDate: {
    type: Date,
    default: null
  },
  childrenCount: {
    type: Number,
    required: true,
    default: 0
  },
  // --- NOVOS CAMPOS ---
  semanaDentro: { // Para trabalhadores não registrados
    type: Boolean,
    default: false
  },
  hasRecurringDiscount: { // Se tem desconto recorrente
    type: Boolean,
    default: false
  },
  recurringDiscountValue: { // O valor do desconto
    type: Number,
    default: 0
  },
  // --- FIM DOS NOVOS CAMPOS ---
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Worker', WorkerSchema);