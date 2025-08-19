// backend/api/routes/farms.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Farm = require('../../models/Farm');

// @route   GET /api/farms
// @desc    Obter todas as fazendas
// @access  Privado
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
// @desc    Adicionar uma nova fazenda
// @access  Privado
router.post('/', auth, async (req, res) => {
  const { name, owner, city, active } = req.body;

  try {
    const newFarm = new Farm({
      name,
      owner,
      city,
      active
    });

    const farm = await newFarm.save();
    res.status(201).json(farm);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   DELETE /api/farms/:id
// @desc    Deletar uma fazenda
// @access  Privado
router.delete('/:id', auth, async (req, res) => {
  try {
    let farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ msg: 'Fazenda não encontrada' });
    }

    await Farm.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Fazenda removida com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;