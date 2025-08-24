// backend/api/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
require('dotenv').config();

router.post('/login', async (req, res) => {
  console.log('--- ROTA /api/auth/login ACESSADA ---');
  const { login, password } = req.body;
  try {
    console.log(`Buscando usuário com login: ${login}`);
    let user = await User.findOne({ login });
    if (!user) {
      console.error(`ERRO: Usuário com login "${login}" não encontrado.`);
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }
    console.log(`Usuário encontrado: ${user.name}`);

    console.log('Comparando senhas...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('ERRO: Senha não corresponde.');
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }
    console.log('Senha correta. Gerando token...');

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;
        console.log('Token gerado com sucesso!');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('--- ERRO FATAL NA ROTA DE LOGIN ---', err);
    res.status(500).send('Erro no servidor');
  }
});

router.get('/me', auth, async (req, res) => {
  console.log('--- ROTA /api/auth/me ACESSADA ---');
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('--- ERRO FATAL NA ROTA /me ---', err);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;