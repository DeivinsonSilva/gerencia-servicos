// backend/api/routes/auth.js

// --- IMPORTAÇÕES (UMA VEZ SÓ, NO TOPO) ---
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
require('dotenv').config();

// --- ROTAS ---

// @route   POST /api/auth/login
// @desc    Autenticar usuário e obter token
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

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

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

// @route   GET /api/auth/me
// @desc    Obter os dados do usuário logado
// @access  Privado
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});


// --- EXPORTAÇÃO ---
module.exports = router;