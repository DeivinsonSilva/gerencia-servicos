const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/db');

connectDB();

const app = express();

// --- CONFIGURAÇÃO DE CORS PARA PRODUÇÃO ---
// Lista de domínios que têm permissão para acessar sua API
const allowedOrigins = [
  'https://gerencia-servicos.vercel.app', // Sua URL de produção do front-end
  'http://localhost:5173' // A URL do seu ambiente de desenvolvimento local
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (como do Insomnia ou apps mobile) ou se a origem estiver na lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  }
};

// Usa as opções de CORS
app.use(cors(corsOptions));
// --- FIM DA CONFIGURAÇÃO DE CORS ---


app.use(express.json());

// Suas rotas
app.use('/api/auth', require(path.join(__dirname, 'routes/auth.js')));
app.use('/api/farms', require(path.join(__dirname, 'routes/farms.js')));
app.use('/api/services', require(path.join(__dirname, 'routes/services.js')));
app.use('/api/users', require(path.join(__dirname, 'routes/users.js')));
app.use('/api/workers', require(path.join(__dirname, 'routes/workers.js')));
app.use('/api/worklogs', require(path.join(__dirname, 'routes/worklogs.js')));
app.use('/api/reports', require(path.join(__dirname, 'routes/reports.js')));
app.use('/api/payroll', require(path.join(__dirname, 'routes/payroll.js')));
app.use('/api/admin', require(path.join(__dirname, 'routes/admin.js')));

module.exports = app;
