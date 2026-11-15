import '../config/env.js';
import app from "./app.js";

const porta = Number(process.env.PORT || process.env.PORTA || 3000);

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
