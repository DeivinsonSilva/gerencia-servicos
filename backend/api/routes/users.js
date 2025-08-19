// backend/api/routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route   POST /api/users/register
// @desc    Registrar um novo usuário (usaremos esta rota para o formulário)
// @access  Público/Privado dependendo da lógica (aqui, qualquer um logado pode criar)
router.post('/register', auth, async (req, res) => {
    const { name, login, password, role } = req.body;
    try {
        let user = await User.findOne({ login });
        if (user) {
            return res.status(400).json({ msg: 'Usuário já existe' });
        }
        user = new User({ name, login, password, role });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// @route   GET /api/users
// @desc    Obter todos os usuários (protegido e somente para Admins)
// @access  Admin
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Acesso negado: somente admins.' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   DELETE /api/users/:id
// @desc    Deletar um usuário (protegido e somente para Admins)
// @access  Admin
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: 'Acesso negado: somente admins.' });
        }
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Usuário removido com sucesso' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no Servidor');
    }
});

module.exports = router;