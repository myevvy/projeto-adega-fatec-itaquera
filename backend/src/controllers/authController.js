// controllers/authController.js
// Só a recuperação de senha. O cadastro oficial é o /cadastro (somente Administrador)
// e o login oficial é o /login, ambos no controllers/usuarios.js.
import "../../config/env.js";

const MENSAGEM_PADRAO =
  "Se o e-mail estiver cadastrado, enviamos o link de recuperação.";

async function esqueciSenha(req, res) {
  const email = String(req.body?.email ?? "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ erro: "Informe o e-mail." });
  }

  try {
    if (!process.env.FIREBASE_API_KEY) {
      console.error("Recuperação de senha: FIREBASE_API_KEY não configurada.");
    } else {
      // Pede ao Firebase para enviar o e-mail de redefinição de senha
      const resposta = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
        },
      );

      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}));
        // Só registra no log (ex.: EMAIL_NOT_FOUND, TOO_MANY_ATTEMPTS_TRY_LATER)
        console.error(
          "Recuperação de senha (Firebase):",
          corpo?.error?.message || resposta.status,
        );
      }
    }
  } catch (erro) {
    console.error("Recuperação de senha:", erro.message);
  }

  // Sempre a mesma resposta, exista o e-mail ou não (não revela quem está cadastrado)
  return res.status(200).json({ mensagem: MENSAGEM_PADRAO });
}

export default { esqueciSenha };
