// backend/api/routes/worklogs.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const WorkLog = require('../../models/WorkLog');

// @route   POST /api/worklogs
// @desc    Criar um novo registro de trabalho
router.post('/', auth, async (req, res) => {
  const { date, worker, farm, service, status, production, unitPrice } = req.body;

  // Validação no servidor: se presente, precisa de fazenda e serviço
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
    res.status(201).json(workLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   GET /api/worklogs
// @desc    Obter registros de trabalho (filtrado por data)
router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ msg: 'A data é obrigatória' });
    }
    
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    const workLogs = await WorkLog.find({ date: { $gte: startDate, $lte: endDate } })
      .populate('worker', 'name')
      .populate('farm', 'name')
      .populate('service', 'name')
      .sort({ createdAt: 1 });

    res.json(workLogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   PUT /api/worklogs/:id
// @desc    Atualizar um registro de trabalho
router.put('/:id', auth, async (req, res) => {
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
router.delete('/:id', auth, async (req, res) => {
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