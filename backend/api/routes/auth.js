// backend/api/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const LoginHistory = require('../../models/LoginHistory');

// 👇 1. ALTERAÇÃO AQUI: Importa a função 'protect' de dentro do objeto do middleware
const { protect } = require('../../middleware/auth');
require('dotenv').config();

router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    let user = await User.findOne({ login });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    const newLogin = new LoginHistory({ user: user._id });
    await newLogin.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// 👇 2. ALTERAÇÃO AQUI: Usa 'protect' em vez de 'auth'
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Erro na rota /me:', err);
    res.status(500).send('Erro no Servidor');
  }
});

// Corrigindo um pequeno erro de digitação de "Exports" para "exports"
module.exports = router;