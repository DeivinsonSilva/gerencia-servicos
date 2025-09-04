// backend/models/Suggestion.js

const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor, forneça um título.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Por favor, forneça uma descrição.'],
  },
  type: {
    type: String,
    required: true,
    enum: ['Melhoria', 'Correção'],
  },
  status: {
    type: String,
    required: true,
    enum: ['Pendente', 'Em Análise', 'Concluído'],
    default: 'Pendente',
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Suggestion', SuggestionSchema);