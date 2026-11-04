import db from "../config/db.js";
import categorias from "./models/categorias.js";
import produtos from "./models/produtos.js";

let catId;
let prodId;

try {
  await db.query("SELECT 1");
  console.log("1. Conexão OK");

  catId = await categorias.postCategorias("TESTE categoria");
  console.log("2. Categoria criada, id:", catId);

  const p = await produtos.postProdutos({
    nome: "TESTE produto",
    categoria: catId,
    precoV: 10,
    custo: 5,
    estoque: 3,
    qntMinima: 5,
    desc: "produto de teste",
    imagem: "/uploads/produtos/teste.png",
  });
  prodId = p.id;
  console.log("3. Produto criado:", p.nome, "| estoque:", p.status_estoque, "(esperado BAIXO)");

  console.log("4. Busca por id:", (await produtos.getProdutos(String(prodId))).nome);
  console.log("5. Busca por nome, id:", (await produtos.getProdutos("TESTE produto")).id);

  await produtos.putProdutos(prodId, { precoV: 12 });
  const hist = await produtos.getHistoricoPreco(prodId);
  console.log("6. Histórico de preço:", hist.length, "registro(s) (esperado 1)");

  const alertas = await produtos.getEstoqueAlertas();
  console.log("7. Produto aparece nos alertas:", alertas.some((x) => x.id === prodId));

  await produtos.deleteProdutos(prodId);
  const ativos = await produtos.getProdutos();
  console.log("8. Depois de inativar, aparece na lista:", ativos.some((x) => x.id === prodId), "(esperado false)");

  console.log("\nTudo certo!");
} catch (erro) {
  console.error("Falhou:", erro.message);
} finally {
 
  if (prodId) {
    await db.query("DELETE FROM produto_historico_preco WHERE produto_id = ?", [prodId]);
    await db.query("DELETE FROM produto WHERE id = ?", [prodId]);
  }
  if (catId) await db.query("DELETE FROM categoria_produto WHERE id = ?", [catId]);
  await db.end();
}