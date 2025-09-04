// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar o token (protege a rota)
exports.protect = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ success: false, error: 'Sem token, autorização negada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Anexa o usuário decodificado à requisição
    // Supondo que o payload do token seja { user: { id: '...', role: '...' } }
    req.user = decoded.user; 
    
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Token não é válido' });
  }
};

// Middleware para verificar o cargo do usuário (autoriza o acesso)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Verifica se o cargo do usuário (anexado pelo middleware 'protect') 
    // está na lista de cargos permitidos para esta rota
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `O usuário com o cargo '${req.user.role}' não tem autorização para acessar esta rota.`
      });
    }
    next();
  };
};