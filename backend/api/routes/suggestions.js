// backend/api/routes/suggestions.js

const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../../middleware/auth');
const Suggestion = require('../../models/Suggestion');
const User = require('../../models/User');

// @desc    Buscar todas as sugestões
// @route   GET /api/suggestions
// @access  Private (Admin)
router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .populate({
        path: 'createdBy',
        select: 'name'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Criar uma nova sugestão
// @route   POST /api/suggestions
// @access  Private (Qualquer usuário logado pode criar)
router.post('/', protect, async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const suggestion = await Suggestion.create(req.body);

    res.status(201).json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// --- 👇 NOVA ROTA DE ATUALIZAÇÃO 👇 ---
// @desc    Atualizar uma sugestão (incluindo o status)
// @route   PUT /api/suggestions/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    let suggestion = await Suggestion.findById(req.params.id);

    if (!suggestion) {
      return res.status(404).json({ success: false, error: 'Sugestão não encontrada' });
    }

    // O { new: true } garante que o documento retornado seja a versão atualizada
    // O { runValidators: true } garante que as regras do modelo (ex: 'enum' para status) sejam aplicadas
    suggestion = await Suggestion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: suggestion });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// --- 👇 NOVA ROTA DE EXCLUSÃO 👇 ---
// @desc    Excluir uma sugestão
// @route   DELETE /api/suggestions/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);

    if (!suggestion) {
      return res.status(404).json({ success: false, error: 'Sugestão não encontrada' });
    }

    await Suggestion.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} }); // Retorna um objeto vazio em caso de sucesso
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;