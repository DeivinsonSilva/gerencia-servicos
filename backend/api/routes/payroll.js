// backend/api/routes/payroll.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const WorkLog = require('../../models/WorkLog');
const Worker = require('../../models/Worker');
const mongoose = require('mongoose');

router.post('/detailed', auth, async (req, res) => {
  try {
    const { workerType, startDate, endDate, inssRate, salarioFamiliaValue } = req.body;

    if (!startDate || !endDate || !workerType) {
      return res.status(400).json({ msg: 'Datas e tipo de folha são obrigatórios.' });
    }

    const workerFilter = {};
    if (workerType === 'registrados') {
      workerFilter.isRegistered = true;
    } else if (workerType === 'nao_registrados') {
      workerFilter.isRegistered = false;
      workerFilter.semanaDentro = { $ne: true };
    } else if (workerType === 'semana_dentro') {
      workerFilter.isRegistered = false;
      workerFilter.semanaDentro = true;
    }

    const workers = await Worker.find(workerFilter).sort({ name: 1 });
    if (workers.length === 0) {
        return res.json([]);
    }
    const workerIds = workers.map(w => w._id);
    
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);
    
    const dailyPayments = await WorkLog.aggregate([
      { $match: { worker: { $in: workerIds }, date: { $gte: start, $lte: end }, status: 'Presente' } },
      {
        $group: {
          _id: {
            worker: '$worker',
            // --- A CORREÇÃO ESTÁ AQUI ---
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } // Removido o hífen extra
          },
          dailyTotal: { $sum: '$totalPay' }
        }
      }
    ]);

    const payrollResults = workers.map(worker => {
      const workerDailyPayments = {};
      dailyPayments
        .filter(p => p._id.worker.equals(worker._id))
        .forEach(p => { workerDailyPayments[p._id.date] = p.dailyTotal; });

      const grossPay = Object.values(workerDailyPayments).reduce((sum, pay) => sum + pay, 0);
      
      let salarioFamilia = 0;
      let inssDeduction = 0;

      if (worker.isRegistered) {
        salarioFamilia = (worker.childrenCount || 0) * (salarioFamiliaValue || 0);
        inssDeduction = grossPay * ((inssRate || 0) / 100);
      }

      const recurringDiscount = worker.recurringDiscountValue || 0;
      const totalDeductions = inssDeduction + recurringDiscount;
      const netPay = (grossPay + salarioFamilia) - totalDeductions;
      
      return {
        workerId: worker._id,
        workerName: worker.name,
        isRegistered: worker.isRegistered,
        dailyPayments: workerDailyPayments,
        grossPay,
        salarioFamilia,
        inssDeduction,
        recurringDiscount,
        totalDeductions,
        netPay,
      };
    });

    res.json(payrollResults);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;