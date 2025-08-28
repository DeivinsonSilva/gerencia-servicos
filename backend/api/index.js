// backend/api/index.js

// --- Importações Essenciais ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../../config/db'); // Conecta ao banco de dados

// --- Inicialização ---
// Executa a conexão com o MongoDB Atlas
connectDB();

// Cria a instância principal do aplicativo Express
const app = express();

// --- Configuração de Middlewares ---

// 1. Configuração de CORS (Cross-Origin Resource Sharing)
// Define quais domínios externos podem fazer requisições para esta API
const allowedOrigins = [
    'http://localhost:5173',      // Permite o acesso do seu ambiente de desenvolvimento local
    process.env.FRONTEND_URL      // Permite o acesso da sua URL de produção (definida na Vercel)
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permite requisições sem 'origin' (ex: Postman) ou de origens na lista
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Acesso não permitido pela política de CORS'));
        }
    },
    // Define quais cabeçalhos customizados a API aceita
    // ✅ Essencial para permitir o envio do token de autenticação
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token'
};

app.use(cors(corsOptions));

// 2. Middleware para processar o corpo de requisições em formato JSON
app.use(express.json());

// --- Definição das Rotas da API ---
// Centraliza e organiza todos os endpoints da aplicação
app.use('/api/auth', require(path.join(__dirname, '../routes/auth.js')));
app.use('/api/admin', require(path.join(__dirname, '../routes/admin.js')));
app.use('/api/farms', require(path.join(__dirname, '../routes/farms.js')));
app.use('/api/payroll', require(path.join(__dirname, '../routes/payroll.js')));
app.use('/api/reports', require(path.join(__dirname, '../routes/reports.js')));
app.use('/api/services', require(path.join(__dirname, '../routes/services.js')));
app.use('/api/users', require(path.join(__dirname, '../routes/users.js')));
app.use('/api/workers', require(path.join(__dirname, '../routes/workers.js')));
app.use('/api/worklogs', require(path.join(__dirname, '../routes/worklogs.js')));


// --- Exportação do Módulo ---
// Exporta o objeto 'app' para ser utilizado pela Vercel (ou pelo servidor de dev local)
module.exports = app;