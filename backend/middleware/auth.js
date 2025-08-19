// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // Pega o token do cabeçalho
  const token = req.header('x-auth-token');

  // Verifica se não há token
  if (!token) {
    return res.status(401).json({ msg: 'Sem token, autorização negada' });
  }

  // Verifica o token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Adiciona o payload do usuário à requisição
    next(); // Passa para a próxima etapa
  } catch (err) {
    res.status(401).json({ msg: 'Token não é válido' });
  }
};