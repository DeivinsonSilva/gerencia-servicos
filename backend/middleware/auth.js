// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  console.log('--- EXECUTANDO MIDDLEWARE DE AUTH ---');
  const token = req.header('x-auth-token');

  if (!token) {
    console.log('Auth middleware: Token não encontrado.');
    return res.status(401).json({ msg: 'Sem token, autorização negada' });
  }

  try {
    console.log('Auth middleware: Verificando token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log('Auth middleware: Token verificado com sucesso!');
    next();
  } catch (err) {
    console.error('Auth middleware: ERRO - Token não é válido.');
    res.status(401).json({ msg: 'Token não é válido' });
  }
};