// backend/api/routes/reports.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth'); // <-- CORREÇÃO AQUI
const WorkLog = require('../../models/WorkLog');
const mongoose = require('mongoose');

// @route   GET /api/reports/annual
// @desc    Gerar relatório anual de dias trabalhados por trabalhador
router.get('/annual', protect, async (req, res) => { // <-- CORREÇÃO AQUI
  try {
    const { year, workerIds } = req.query;

    if (!year || !workerIds) {
      return res.status(400).json({ msg: 'Ano e IDs de trabalhadores são obrigatórios.' });
    }

    // Converte a string de IDs em um array de ObjectIds do MongoDB
    const workerObjectIds = workerIds.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
    const yearNum = parseInt(year);

    const startDate = new Date(Date.UTC(yearNum, 0, 1));
    const endDate = new Date(Date.UTC(yearNum, 11, 31, 23, 59, 59, 999));

    const report = await WorkLog.aggregate([
      // 1. Filtra os documentos relevantes
      {
        $match: {
          worker: { $in: workerObjectIds },
          date: { $gte: startDate, $lte: endDate },
          status: 'Presente'
        }
      },
      // 2. Extrai o mês de cada data
      {
        $addFields: {
          month: { $month: "$date" }
        }
      },
      // 3. Agrupa por trabalhador e por mês, contando os dias
      {
        $group: {
          _id: { worker: "$worker", month: "$month" },
          daysWorked: { $sum: 1 }
        }
      },
      // 4. Reagrupa os resultados por trabalhador
      {
        $group: {
          _id: "$_id.worker",
          monthlyData: {
            $push: {
              month: "$_id.month",
              days: "$daysWorked"
            }
          },
          totalDays: { $sum: "$daysWorked" }
        }
      },
      // 5. Junta com a coleção de workers para pegar o nome
      {
        $lookup: {
          from: 'workers',
          localField: '_id',
          foreignField: '_id',
          as: 'workerInfo'
        }
      },
      // 6. Formata o resultado final
      {
        $project: {
          _id: 0,
          workerId: "$_id",
          workerName: { $arrayElemAt: ["$workerInfo.name", 0] },
          monthlyData: "$monthlyData",
          totalDays: "$totalDays"
        }
      },
      // 7. Ordena por nome do trabalhador
      {
        $sort: { workerName: 1 }
      }
    ]);

    res.json(report);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;