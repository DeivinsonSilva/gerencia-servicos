// backend/api/routes/services.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const Service = require('../../models/Service');
const { check, validationResult } = require('express-validator');

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.onlyActive === 'true') {
      filter.active = true;
    }
    const services = await Service.find(filter).sort({ name: 1 });
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

router.post('/',
  [
    protect,
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

router.put('/:id',
  [
    protect,
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

router.delete('/:id', protect, async (req, res) => {
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