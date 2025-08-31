// backend/api/routes/suggestions.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Importa o mongoose para usar o ObjectId

const { protect, authorize } = require('../../middleware/auth');
const Suggestion = require('../../models/Suggestion');
const User = require('../../models/User');

// @desc    Buscar todas as sugestões (COM ORDENAÇÃO POR STATUS)
// @route   GET /api/suggestions
// @access  Private (Admin)
router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const suggestions = await Suggestion.aggregate([
      // 1. Adiciona um campo temporário 'statusOrder' para a ordenação
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'Pendente'] }, then: 1 },
                { case: { $eq: ['$status', 'Em Análise'] }, then: 2 },
                { case: { $eq: ['$status', 'Concluído'] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },
      // 2. Ordena pelo status e depois pela data de criação
      {
        $sort: {
          statusOrder: 1,   // Ordem crescente (1, 2, 3)
          createdAt: -1     // Mais recentes primeiro dentro de cada status
        }
      },
      // 3. Junta os dados do usuário para obter o nome (similar ao populate)
      {
        $lookup: {
          from: 'users', // nome da coleção de usuários no MongoDB
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creatorDetails'
        }
      },
      // 4. Desconstrói o array retornado pelo $lookup
      {
        $unwind: { path: "$creatorDetails", preserveNullAndEmptyArrays: true }
      },
      // 5. Formata o campo 'createdBy' para se parecer com o resultado do .populate()
      //    e remove os campos temporários que criamos.
      {
        $project: {
          title: 1,
          description: 1,
          type: 1,
          status: 1,
          createdAt: 1,
          createdBy: {
            _id: "$creatorDetails._id",
            name: "$creatorDetails.name"
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    console.error(error);
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

// @desc    Atualizar uma sugestão (incluindo o status)
// @route   PUT /api/suggestions/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    let suggestion = await Suggestion.findById(req.params.id);

    if (!suggestion) {
      return res.status(404).json({ success: false, error: 'Sugestão não encontrada' });
    }

    suggestion = await Suggestion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: suggestion });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

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

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;