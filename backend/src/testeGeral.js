import perfilModel from "./models/auth/perfil.js";
import permissaoModel from "./models/auth/permissao.js";
import preferenciaNotificacaoModel from "./models/auth/preferenciaNotificacao.js";
import comprasModel from "./models/comercial/compras.js";
import itemCompraModel from "./models/comercial/itemCompra.js";
import vendasModel from "./models/comercial/vendas.js";
import itemVendaModel from "./models/comercial/itemVenda.js";
import movimentacoesModel from "./models/estoque/movimentacaoEstoque.js";
import produtosModel from "./models/estoque/produtos.js";
import despesasModel from "./models/financeiro/despesas.js";
import notificacoesModel from "./models/financeiro/notificacoes.js";
import confirmModel from "./models/auditoria/confirmacaoOperacao.js";
import estabelecimentoModel from "./models/config/estabelecimento.js";

async function rodarTesteGeralCompleto() {
  console.log("==========================================");
  console.log("🚀 INICIANDO TESTE GERAL DA ESTRUTURA COMPLETA");
  console.log("==========================================\n");

  try {
    // 1. Auth & Permissões
    console.log("🔐 Testando Auth e Configurações de Usuário...");
    const perfis = await perfilModel.getPerfis();
    console.log(`   ✓ Perfis cadastrados: ${perfis.length}`);
    const permissoes = await permissaoModel.getPermissoes();
    console.log(`   ✓ Permissões cadastradas: ${permissoes.length}`);
    
    const prefNotif = await preferenciaNotificacaoModel.getPreferenciaPorUsuario(1);
    console.log(`   ✓ Preferências de notificação carregadas para o usuário 1.`);

    // 2. Comercial (Compras e Vendas)
    console.log("\n🛒 Testando Comercial (Compras, Vendas e Itens)...");
    const compras = await comprasModel.getCompras();
    console.log(`   ✓ Total de compras: ${compras.length}`);
    if (compras.length > 0) {
      const itensC = await itemCompraModel.getItensPorCompra(compras[0].id);
      console.log(`     - Itens da compra #${compras[0].id}: ${itensC.length}`);
    }

    const vendas = await vendasModel.getVendas();
    console.log(`   ✓ Total de vendas: ${vendas.length}`);
    if (vendas.length > 0) {
      const itensV = await itemVendaModel.getItensPorVenda(vendas[0].id);
      console.log(`     - Itens da venda #${vendas[0].id}: ${itensV.length}`);
    }

    // 3. Estoque
    console.log("\n📦 Testando Estoque e Movimentações...");
    const movs = await movimentacoesModel.getMovimentacoes();
    console.log(`   ✓ Histórico de movimentações: ${movs.length}`);

    // 4. Financeiro
    console.log("\n💰 Testando Financeiro (Despesas e Notificações)...");
    const despesas = await despesasModel.getDespesas();
    console.log(`   ✓ Total de despesas: ${despesas.length}`);
    const notifs = await notificacoesModel.getNotificacoesUsuario(1);
    console.log(`   ✓ Notificações do sistema (Usuário 1): ${notifs.length}`);

    // 5. Auditoria
    console.log("\n📋 Testando Auditoria (Confirmações de Operação)...");
    const confirmacoes = await confirmModel.getConfirmacoes();
    console.log(`   ✓ Registros de auditoria encontrados: ${confirmacoes.length}`);

    // 6. Configurações (Estabelecimento)
    console.log("\n⚙️ Testando Estabelecimento...");
    const estab = await estabelecimentoModel.getEstabelecimento();
    // Ajustado para usar 'nome_estabelecimento' conforme a tabela real do banco
    console.log(`   ✓ Estabelecimento carregado: ${estab ? estab.nome_estabelecimento : "Não configurado"}`);

    console.log("\n==========================================");
    console.log("✨ TODOS OS MODELS FORAM TESTADOS COM SUCESSO!");
    console.log("==========================================");
  } catch (erro) {
    console.error("\n❌ Erro durante o teste geral:", erro.message);
    if (erro.code) console.error(`   Código do erro: ${erro.code}`);
  } finally {
    process.exit();
  }
}

rodarTesteGeralCompleto();