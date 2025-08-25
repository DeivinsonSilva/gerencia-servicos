// backend/api/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const LoginHistory = require('../../models/LoginHistory'); // <-- 1. IMPORTA O NOVO MODEL
const auth = require('../../middleware/auth');
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

    // --- 2. NOVA LÓGICA DE REGISTRO DE LOGIN ---
    // Assim que o login é validado, criamos um registro no histórico.
    const newLogin = new LoginHistory({ user: user._id });
    await newLogin.save();
    // --- FIM DA NOVA LÓGICA ---

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

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Erro na rota /me:', err);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;