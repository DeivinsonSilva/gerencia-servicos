// backend/api/index.js

// 1. Importa os pacotes necessários
const express = require('express');
const cors = require('cors'); // Pacote para lidar com o CORS
const connectDB = require('../config/db');

// 2. Conecta ao Banco de Dados
connectDB();

// 3. Inicia o aplicativo Express
const app = express();

// 4. Habilita o CORS para TODAS as requisições
// Esta é a linha mais importante para resolver o seu problema.
// Ela deve vir ANTES da definição das rotas.
app.use(cors());

// 5. Middlewares para processar o corpo das requisições
app.use(express.json());

// 6. Definindo as Rotas da API (depois do CORS)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/services', require('./routes/services'));
app.use('/api/users', require('./routes/users'));

// 7. Rota de Teste (opcional)
app.get('/api', (req, res) => res.send('API Rodando!'));

// 8. Exporta o app para a Vercel
module.exports = app;