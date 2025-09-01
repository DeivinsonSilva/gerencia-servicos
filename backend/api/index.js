// backend/api/index.js

// --- Importações Essenciais ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/db'); // Conecta ao banco de dados

// --- Inicialização ---
// Executa a conexão com o MongoDB Atlas
connectDB();

// Cria a instância principal do aplicativo Express
const app = express();

// --- Configuração de Middlewares ---

// Pega a string de URLs de produção do ambiente e transforma em um array
const productionUrls = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];

// Define um padrão Regex para todas as URLs de preview da Vercel
const previewUrlPattern = /^https:\/\/gerencia-servicos-git-.*-deivinsonsilvas-projects\.vercel\.app$/;

const allowedOrigins = [
    'http://localhost:5173', // Ambiente de desenvolvimento local
    ...productionUrls,      // Suas URLs de produção e domínios customizados
    previewUrlPattern       // O padrão para todos os previews
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permite requisições sem 'origin' (como Insomnia, apps mobile)
        if (!origin) return callback(null, true);

        // Verifica se a origem está na lista de URLs fixas ou se corresponde ao padrão Regex
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return allowedOrigin === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Acesso não permitido pela política de CORS'));
        }
    },
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token'
};

app.use(cors(corsOptions));

// 2. Middleware para processar o corpo de requisições em formato JSON
app.use(express.json());

// --- Definição das Rotas da API ---
// Corrigindo os caminhos para apontar para a pasta ./routes/ a partir de /api/
app.use('/api/auth', require(path.join(__dirname, 'routes/auth.js')));
app.use('/api/admin', require(path.join(__dirname, 'routes/admin.js')));
app.use('/api/farms', require(path.join(__dirname, 'routes/farms.js')));
app.use('/api/payroll', require(path.join(__dirname, 'routes/payroll.js')));
app.use('/api/reports', require(path.join(__dirname, 'routes/reports.js')));
app.use('/api/services', require(path.join(__dirname, 'routes/services.js')));
app.use('/api/users', require(path.join(__dirname, 'routes/users.js')));
app.use('/api/workers', require(path.join(__dirname, 'routes/workers.js')));
app.use('/api/worklogs', require(path.join(__dirname, 'routes/worklogs.js')));
app.use('/api/suggestions', require(path.join(__dirname, 'routes/suggestions.js')));


// --- Exportação do Módulo ---
// Exporta o objeto 'app' para ser utilizado pela Vercel (ou pelo servidor de dev local)
module.exports = app;