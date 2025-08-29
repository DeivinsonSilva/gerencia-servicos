// backend/api/routes/workers.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth'); // <-- CORREÇÃO AQUI
const Worker = require('../../models/Worker');
const { check, validationResult } = require('express-validator');

// @route   POST /api/workers
// @desc    Adicionar um novo trabalhador (com validação)
router.post('/',
  [
    protect, // <-- CORREÇÃO AQUI
    check('name', 'O nome do trabalhador é obrigatório').trim().not().isEmpty(),
    check('isRegistered', 'O campo "Registrado" deve ser um valor booleano (true/false)').isBoolean(),
    check('childrenCount', 'O número de filhos deve ser um valor numérico').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, isRegistered, registrationDate, childrenCount, semanaDentro, hasRecurringDiscount, recurringDiscountValue, active } = req.body;
    try {
      const newWorker = new Worker({ name, isRegistered, registrationDate, childrenCount, semanaDentro, hasRecurringDiscount, recurringDiscountValue, active });
      const worker = await newWorker.save();
      res.status(201).json(worker);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no Servidor');
    }
  }
);

// @route   GET /api/workers
// @desc    Obter todos os trabalhadores
router.get('/', protect, async (req, res) => { // <-- CORREÇÃO AQUI
  try {
    const workers = await Worker.find().sort({ name: 1 });
    res.json(workers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   PUT /api/workers/:id
// @desc    Atualizar (editar) um trabalhador (com validação)
router.put('/:id',
  [
    protect, // <-- CORREÇÃO AQUI
    check('name', 'O nome do trabalhador é obrigatório').trim().not().isEmpty(),
    check('isRegistered', 'O campo "Registrado" deve ser um valor booleano (true/false)').isBoolean(),
    check('childrenCount', 'O número de filhos deve ser um valor numérico').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, isRegistered, registrationDate, childrenCount, semanaDentro, hasRecurringDiscount, recurringDiscountValue, active } = req.body;
    const workerFields = { name, isRegistered, registrationDate, childrenCount, semanaDentro, hasRecurringDiscount, recurringDiscountValue, active };
    try {
      let worker = await Worker.findById(req.params.id);
      if (!worker) return res.status(404).json({ msg: 'Trabalhador não encontrado' });

      worker = await Worker.findByIdAndUpdate(req.params.id, { $set: workerFields }, { new: true });
      res.json(worker);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no Servidor');
    }
  }
);

// @route   DELETE /api/workers/:id
// @desc    Deletar um trabalhador
router.delete('/:id', protect, async (req, res) => { // <-- CORREÇÃO AQUI
  try {
    let worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ msg: 'Trabalhador não encontrado' });
    
    await Worker.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Trabalhador removido com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;