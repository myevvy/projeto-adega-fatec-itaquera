import app from "./app";
import '../config/env.js';

const porta = process.env.PORT || 3000;

app.listen(porta, console.log("ouvindo na porta 3000"));
