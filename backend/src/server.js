import '../config/env.js';
import app from "./app.js";

const porta = process.env.PORT || 3000;

app.listen(porta, console.log("ouvindo na porta 3000"));
