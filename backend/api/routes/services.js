const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Service = require('../../models/Service');
const { check, validationResult } = require('express-validator');

// @route   GET /api/services
// @desc    Obter todos os serviços
// @access  Privado
router.get('/', auth, async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   POST /api/services
// @desc    Adicionar um novo serviço (com validação)
router.post('/',
  [
    auth,
    check('name', 'O nome do serviço é obrigatório').not().isEmpty().trim(),
    check('price', 'O preço é obrigatório e deve ser um número').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, active } = req.body;
    try {
      const newService = new Service({ name, price, active });
      const service = await newService.save();
      res.status(201).json(service);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no Servidor');
    }
  }
);

// @route   PUT /api/services/:id
// @desc    Atualizar (editar) um serviço (com validação)
router.put('/:id',
  [
    auth,
    check('name', 'O nome do serviço é obrigatório').not().isEmpty().trim(),
    check('price', 'O preço é obrigatório e deve ser um número').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, active } = req.body;
    const serviceFields = {};
    if (name) serviceFields.name = name;
    if (price !== undefined) serviceFields.price = price;
    if (typeof active === 'boolean') serviceFields.active = active;

    try {
        let service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ msg: 'Serviço não encontrado' });
        }

        service = await Service.findByIdAndUpdate(
            req.params.id,
            { $set: serviceFields },
            { new: true }
        );
        res.json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no Servidor');
    }
  }
);

// @route   DELETE /api/services/:id
// @desc    Deletar um serviço
// @access  Privado
router.delete('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
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