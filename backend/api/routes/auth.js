// backend/api/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
require('dotenv').config();

// @route   POST /login
// @desc    Autenticar usuário e obter token
router.post('/login', async (req, res) => {
  // Linha de depuração que adicionamos
  console.log('>>> TENTATIVA DE ACESSAR A ROTA POST /login <<<'); 
  
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
        console.log('>>> LOGIN BEM-SUCEDIDO, GERANDO TOKEN <<<');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   GET /me
// @desc    Obter os dados do usuário logado
// @access  Privado
router.get('/me', auth, async (req, res) => {
  // Linha de depuração
  console.log('>>> TENTATIVA DE ACESSAR A ROTA GET /me <<<'); 
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;