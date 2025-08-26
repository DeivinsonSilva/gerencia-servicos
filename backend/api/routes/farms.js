// backend/api/routes/farms.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Farm = require('../../models/Farm');
const { check, validationResult } = require('express-validator');

// @route   GET /api/farms
router.get('/', auth, async (req, res) => {
  try {
    const farms = await Farm.find().sort({ name: 1 });
    res.json(farms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   POST /api/farms
router.post('/',
  [
    auth,
    // --- REGRAS DE VALIDAÇÃO REFINADAS ---
    check('name', 'O nome da fazenda é obrigatório').trim().not().isEmpty(),
    check('owner', 'O nome do proprietário é obrigatório').trim().not().isEmpty(),
    check('city', 'A cidade é obrigatória').trim().not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, owner, city, active } = req.body;
    try {
      const newFarm = new Farm({ name, owner, city, active });
      const farm = await newFarm.save();
      res.status(201).json(farm);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no Servidor');
    }
  }
);

// @route   PUT /api/farms/:id
router.put('/:id',
  [
    auth,
    check('name', 'O nome da fazenda é obrigatório').trim().not().isEmpty(),
    check('owner', 'O nome do proprietário é obrigatório').trim().not().isEmpty(),
    check('city', 'A cidade é obrigatória').trim().not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, owner, city, active } = req.body;
    const farmFields = { name, owner, city, active };
    try {
      let farm = await Farm.findById(req.params.id);
      if (!farm) return res.status(404).json({ msg: 'Fazenda não encontrada' });

      farm = await Farm.findByIdAndUpdate(req.params.id, { $set: farmFields }, { new: true });
      res.json(farm);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no Servidor');
    }
  }
);

// @route   DELETE /api/farms/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    let farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ msg: 'Fazenda não encontrada' });
    
    await Farm.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Fazenda removida com sucesso' });
  } catch (err)
 {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;