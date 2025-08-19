// backend/api/routes/services.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Service = require('../../models/Service');

// @route   GET /api/services
// @desc    Obter todos os serviços
// @access  Privado
router.get('/', auth, async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 }); // .sort() para ordenar alfabeticamente
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   POST /api/services
// @desc    Adicionar um novo serviço
// @access  Privado
router.post('/', auth, async (req, res) => {
  const { name, price, active } = req.body;

  try {
    const newService = new Service({
      name,
      price,
      active
    });

    const service = await newService.save();
    res.status(201).json(service); // Retorna o serviço recém-criado
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   DELETE /api/services/:id
// @desc    Deletar um serviço
// @access  Privado
router.delete('/:id', auth, async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ msg: 'Serviço não encontrado' });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Serviço removido com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;