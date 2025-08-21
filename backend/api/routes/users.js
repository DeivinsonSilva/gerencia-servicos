// backend/api/routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route   POST /api/users/register
// @desc    Registrar um novo usuário
router.post('/register', auth, async (req, res) => {
    const { name, login, password, role } = req.body;
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: 'Acesso negado: somente admins.' });
        }
        let user = await User.findOne({ login });
        if (user) {
            return res.status(400).json({ msg: 'Login já está em uso.' });
        }
        user = new User({ name, login, password, role });
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// @route   GET /api/users
// @desc    Obter todos os usuários
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

// @route   PUT /api/users/:id
// @desc    Atualizar (editar) um usuário
// @access  Admin
router.put('/:id', auth, async (req, res) => {
    // Apenas Admins podem editar
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Acesso negado: somente admins.' });
    }

    const { name, login, role } = req.body;

    const userFields = {};
    if (name) userFields.name = name;
    if (login) userFields.login = login;
    if (role) userFields.role = role;

    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        
        // Verifica se o novo login já está em uso por outro usuário
        if (login && login !== user.login) {
            const existingUser = await User.findOne({ login });
            if (existingUser) {
                return res.status(400).json({ msg: 'Login já está em uso.' });
            }
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no Servidor');
    }
});

// @route   DELETE /api/users/:id
// @desc    Deletar um usuário
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