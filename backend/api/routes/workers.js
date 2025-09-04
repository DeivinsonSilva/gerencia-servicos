// backend/api/routes/workers.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const Worker = require('../../models/Worker');
const { check, validationResult } = require('express-validator');

router.post('/',
  [
    protect,
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

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.onlyActive === 'true') {
      filter.active = true;
    }
    const workers = await Worker.find(filter).sort({ name: 1 });
    res.json(workers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

router.put('/:id',
  [
    protect,
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

router.delete('/:id', protect, async (req, res) => {
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