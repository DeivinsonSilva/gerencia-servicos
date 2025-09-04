// backend/api/routes/admin.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../../middleware/auth'); // <-- 1. IMPORTAÇÃO CORRETA

// Importa todos os modelos
const User = require('../../models/User');
const Farm = require('../../models/Farm');
const Service = require('../../models/Service');
const Worker = require('../../models/Worker');
const WorkLog = require('../../models/WorkLog');
const LoginHistory = require('../../models/LoginHistory');

// A função 'adminOnly' foi removida pois agora usamos o middleware 'authorize('Admin')'

// @route   GET /api/admin/stats
// @desc    Obter estatísticas do sistema e do banco de dados
router.get('/stats', protect, authorize('Admin'), async (req, res) => { // <-- 2. MIDDLEWARES CORRIGIDOS
    try {
        const db = mongoose.connection.db;
        const [
            dbStats, userCount, farmCount, serviceCount,
            workerCount, workLogCount, loginCount
        ] = await Promise.all([
            db.stats(),
            User.countDocuments(), Farm.countDocuments(),
            Service.countDocuments(), Worker.countDocuments(),
            WorkLog.countDocuments(), LoginHistory.countDocuments()
        ]);
        const stats = {
            systemInfo: {
                nodeVersion: process.version,
                environment: process.env.NODE_ENV || 'development',
                dbStatus: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
            },
            dbInfo: { dbName: db.databaseName, storageSize: (dbStats.storageSize / (1024 * 1024)).toFixed(2) + ' MB' },
            collectionStats: [
                { name: 'Users', count: userCount },
                { name: 'Farms', count: farmCount },
                { name: 'Services', count: serviceCount },
                { name: 'Workers', count: workerCount },
                { name: 'WorkLogs', count: workLogCount },
                { name: 'LoginHistory', count: loginCount, label: 'Acessos ao Sistema' }
            ],
            totalLogins: loginCount
        };
        res.json(stats);
    } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        res.status(500).send('Erro no Servidor');
    }
});

// @route   DELETE /api/admin/collection/:name
// @desc    Limpar (deletar todos os documentos de) uma coleção
// @access  Admin
router.delete('/collection/:name', protect, authorize('Admin'), async (req, res) => { // <-- 2. MIDDLEWARES CORRIGIDOS
    try {
        const collectionName = req.params.name;

        const collections = {
            Farms: Farm,
            Services: Service,
            Workers: Worker,
            WorkLogs: WorkLog,
            'Acessos ao Sistema': LoginHistory, // <-- CORREÇÃO AQUI
        };

        const Model = collections[collectionName];

        if (!Model) {
            return res.status(404).json({ msg: 'Coleção não encontrada ou não permitida para limpeza.' });
        }

        const deleteResult = await Model.deleteMany({});

        res.json({ msg: `Coleção '${collectionName}' limpa com sucesso. ${deleteResult.deletedCount} registros removidos.` });

    } catch (err) {
        console.error(`Erro ao limpar a coleção ${req.params.name}:`, err);
        res.status(500).send('Erro no Servidor');
    }
});

module.exports = router;