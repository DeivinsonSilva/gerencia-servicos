// backend/models/LoginHistory.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const LoginHistorySchema = new Schema({
  user: { // Referência ao usuário que logou
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  loginTimestamp: { // Data e hora do login
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LoginHistory', LoginHistorySchema);