// Este arquivo é APENAS para desenvolvimento local
const app = require('./api/index.js');
const PORT = 3001; // Usaremos uma porta diferente para evitar conflitos

app.listen(PORT, () => {
  console.log(`--- SERVIDOR BACK-END LOCAL ---`);
  console.log(`Rodando em http://localhost:${PORT}`);
  console.log(`-----------------------------`);
});