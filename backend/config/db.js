// backend/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

// Variável para guardar o estado da conexão
let isConnected; 

const connectDB = async () => {
  // Se já estivermos conectados, não faz nada e retorna.
  // mongoose.connections[0].readyState === 1 significa "conectado"
  if (isConnected && mongoose.connections[0].readyState === 1) {
    // console.log('=> usando conexão existente com o banco de dados');
    return;
  }

  try {
    // Tenta criar uma nova conexão
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true; // Marca que agora estamos conectados
    console.log('MongoDB Conectado...');
  } catch (err) {
    console.error('Falha ao conectar com o MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;