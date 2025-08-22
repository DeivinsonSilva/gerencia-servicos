// backend/models/WorkLog.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  worker: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  farm: {
    type: Schema.Types.ObjectId,
    ref: 'Farm'
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service'
  },
  status: {
    type: String,
    enum: ['Presente', 'Falta'],
    default: 'Presente',
    required: true
  },
  production: {
    type: Number,
    default: 0
  },
  unitPrice: {
    type: Number,
    default: 0
  },
  totalPay: {
    type: Number,
    default: 0
  },
}, {
  timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('WorkLog', WorkLogSchema);