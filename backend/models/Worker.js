// backend/models/Worker.js
const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // Remove espaços em branco do início e do fim
  },
  isRegistered: { // "Registrado em Carteira?"
    type: Boolean,
    required: true
  },
  registrationDate: { // "Data do Registro"
    type: Date,
    default: null
  },
  childrenCount: { // "Número de Filhos"
    type: Number,
    required: true,
    default: 0
  },
  active: { // "Trabalhador Ativo"
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Worker', WorkerSchema);