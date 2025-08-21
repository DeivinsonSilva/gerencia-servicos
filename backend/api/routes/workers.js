const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Worker = require('../../models/Worker');

// @route   POST /api/workers
// @desc    Adicionar um novo trabalhador
router.post('/', auth, async (req, res) => {
  const { name, isRegistered, registrationDate, childrenCount, semanaDentro, hasRecurringDiscount, recurringDiscountValue, active } = req.body;
  try {
    const newWorker = new Worker({ name, isRegistered, registrationDate, childrenCount, semanaDentro, hasRecurringDiscount, recurringDiscountValue, active });
    const worker = await newWorker.save();
    res.status(201).json(worker);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   GET /api/workers
// @desc    Obter todos os trabalhadores
router.get('/', auth, async (req, res) => {
  try {
    const workers = await Worker.find().sort({ name: 1 });
    res.json(workers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   PUT /api/workers/:id
// @desc    Atualizar (editar) um trabalhador
router.put('/:id', auth, async (req, res) => {
  const { name, isRegistered, registrationDate, childrenCount, semanaDentro, hasRecurringDiscount, recurringDiscountValue, active } = req.body;
  
  const workerFields = {};
  if (name !== undefined) workerFields.name = name;
  if (isRegistered !== undefined) workerFields.isRegistered = isRegistered;
  if (registrationDate !== undefined) workerFields.registrationDate = registrationDate;
  if (childrenCount !== undefined) workerFields.childrenCount = childrenCount;
  if (semanaDentro !== undefined) workerFields.semanaDentro = semanaDentro;
  if (hasRecurringDiscount !== undefined) workerFields.hasRecurringDiscount = hasRecurringDiscount;
  if (recurringDiscountValue !== undefined) workerFields.recurringDiscountValue = recurringDiscountValue;
  if (active !== undefined) workerFields.active = active;

  try {
    let worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ msg: 'Trabalhador não encontrado' });

    worker = await Worker.findByIdAndUpdate(req.params.id, { $set: workerFields }, { new: true });
    res.json(worker);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   DELETE /api/workers/:id
// @desc    Deletar um trabalhador
router.delete('/:id', auth, async (req, res) => {
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