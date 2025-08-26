// backend/api/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/db');

connectDB();

const app = express();

// Habilita o CORS para todas as origens. Essencial para o deploy.
app.use(cors());

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