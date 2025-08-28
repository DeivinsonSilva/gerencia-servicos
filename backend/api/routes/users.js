const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

// @route   POST /api/users/register
// @desc    Registrar um novo usuário (Admin)
router.post('/register',
  [
    auth,
    check('name', 'O nome é obrigatório').not().isEmpty(),
    check('login', 'O login é obrigatório').not().isEmpty(),
    check('password', 'A senha deve ter no mínimo 6 caracteres').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Acesso negado: somente admins podem registrar novos usuários.' });
    }

    const { name, login, password, role } = req.body;
    try {
      let user = await User.findOne({ login });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'Login já está em uso.' }] });
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
  }
);

// @route   GET /api/users
// @desc    Obter todos os usuários (Admin)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Acesso negado: somente admins.' });
    }
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @route   PUT /api/users/:id
// @desc    Atualizar (editar) um usuário (Admin)
router.put('/:id',
  [
    auth,
    check('name', 'O nome é obrigatório').not().isEmpty(),
    check('login', 'O login é obrigatório').not().isEmpty(),
    check('role', 'A permissão é obrigatória').isIn(['Admin', 'Operador'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Acesso negado: somente admins.' });
    }
    const { name, login, role } = req.body;
    const userFields = { name, login, role };
    try {
      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado' });
      }
      if (login !== user.login) {
        const existingUser = await User.findOne({ login });
        if (existingUser) {
          return res.status(400).json({ errors: [{ msg: 'Login já está em uso.' }] });
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
  }
);

// @route   DELETE /api/users/:id
// @desc    Deletar um usuário (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Acesso negado: somente admins.' });
    }
    if (req.user.id === req.params.id) {
        return res.status(400).json({ msg: 'Você não pode deletar seu próprio usuário.' });
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

// @route   POST /api/users/change-password
// @desc    Alterar a senha do usuário logado
// @access  Privado (qualquer usuário logado)
router.post('/change-password',
  [
    auth,
    check('currentPassword', 'A senha atual é obrigatória').not().isEmpty(),
    check('newPassword', 'A nova senha deve ter no mínimo 6 caracteres').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'A senha atual está incorreta.' }] });
      }
      user.password = newPassword;
      await user.save();
      res.json({ msg: 'Senha alterada com sucesso!' });
    } catch (err) {
      console.error('Erro ao alterar senha:', err.message);
      res.status(500).send('Erro no Servidor');
    }
  }
);

module.exports = router;