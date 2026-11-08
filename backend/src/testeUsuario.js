import usuarioModel from "./models/auth/usuarios.js";

async function rodarTeste() {
  try {
    console.log("🧪 A testar a função putUsuario...");
    
    // Põe aqui o ID de um utilizador que realmente exista no teu banco de dados
    const idUsuario = 1; 
    
    const sucesso = await usuarioModel.putUsuario(
      idUsuario,
      "Nome Testado com Sucesso", // nome
      undefined,                  // email (mantém o atual)
      undefined,                  // senha_hash (mantém a atual)
      undefined,                  // end
      undefined,                  // cep
      "(11) 98888-8888",          // tel
      "1995-05-15",               // aniversario
      undefined,                  // sobre
      undefined,                  // cargo
      "ADMINISTRADOR"             // tipo_logado
    );

    if (sucesso) {
      console.log("✅ Sucesso! O utilizador foi atualizado corretamente no MySQL.");
    } else {
      console.log("⚠️ Nenhum campo foi alterado.");
    }
  } catch (erro) {
    console.error("❌ Erro durante o teste do utilizador:", erro.message);
  } finally {
    process.exit();
  }
}

rodarTeste();