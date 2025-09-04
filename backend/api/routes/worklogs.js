// backend/api/routes/worklogs.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const WorkLog = require('../../models/WorkLog');

// @route   POST /api/worklogs
// @desc    Criar um novo registro de trabalho
router.post('/', protect, async (req, res) => {
  const { date, worker, farm, service, status, production, unitPrice } = req.body;

  if (status === 'Presente' && (!farm || !service)) {
    return res.status(400).json({ msg: 'Fazenda e Serviço são obrigatórios para um registro de presença.' });
  }
  try {
    const totalPay = status === 'Falta' ? 0 : (production || 0) * (unitPrice || 0);
    const newWorkLog = new WorkLog({
      date,
      worker,
      farm: status === 'Presente' ? farm : null,
      service: status === 'Presente' ? service : null,
      status,
      production: status === 'Presente' ? production : 0,
      unitPrice: status === 'Presente' ? unitPrice : 0,
      totalPay,
    });
    const workLog = await newWorkLog.save();
    const populatedLog = await WorkLog.findById(workLog._id)
        .populate('worker', 'name')
        .populate('farm', 'name')
        .populate('service', 'name');
    res.status(201).json(populatedLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   GET /api/worklogs
// @desc    Obter registros de trabalho com filtros e paginação (ou todos)
router.get('/', protect, async (req, res) => {
  try {
    const { date, month, page = 1, limit = 10, fetchAll } = req.query;
    
    const query = {};
    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (month) {
      const year = parseInt(month.split('-')[0]);
      const monthIndex = parseInt(month.split('-')[1]) - 1;
      const startDate = new Date(Date.UTC(year, monthIndex, 1));
      const endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // 👇 ALTERAÇÃO AQUI: Lógica para desativar a paginação 👇
    if (fetchAll === 'true') {
      // Se fetchAll=true, busca todos os documentos sem paginação
      const logs = await WorkLog.find(query)
        .populate('worker', 'name')
        .populate('farm', 'name')
        .populate('service', 'name')
        .sort({ date: -1, createdAt: -1 });
      
      return res.json({
        logs,
        total: logs.length,
        page: 1,
        pages: 1
      });
    }

    // Lógica de paginação padrão (continua funcionando como antes)
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [logs, total] = await Promise.all([
        WorkLog.find(query)
            .populate('worker', 'name')
            .populate('farm', 'name')
            .populate('service', 'name')
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNumber),
        WorkLog.countDocuments(query)
    ]);
    
    res.json({
        logs,
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   PUT /api/worklogs/:id
// @desc    Atualizar um registro de trabalho
router.put('/:id', protect, async (req, res) => {
  const { farm, service, status, production, unitPrice } = req.body;
  try {
    let workLog = await WorkLog.findById(req.params.id);
    if (!workLog) return res.status(404).json({ msg: 'Registro não encontrado' });

    const totalPay = status === 'Falta' ? 0 : (production || 0) * (unitPrice || 0);
    
    const updatedFields = {
      farm: status === 'Presente' ? farm : null,
      service: status === 'Presente' ? service : null,
      status,
      production: status === 'Presente' ? production : 0,
      unitPrice: status === 'Presente' ? unitPrice : 0,
      totalPay
    };

    workLog = await WorkLog.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true })
      .populate('worker', 'name')
      .populate('farm', 'name')
      .populate('service', 'name');

    res.json(workLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   DELETE /api/worklogs/:id
// @desc    Deletar um registro de trabalho
router.delete('/:id', protect, async (req, res) => {
  try {
    let workLog = await WorkLog.findById(req.params.id);
    if (!workLog) return res.status(404).json({ msg: 'Registro não encontrado' });
    await WorkLog.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Registro removido com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;