import { Router } from "express";
const router = Router();
import produtos from "./controllers/produtos.js";
import usuarios from "./controllers/usuarios.js";
import fornecedores from "./controllers/fornecedores.js";
import compras from "./controllers/compra.js";
import verificaAdm from "./middlewares/verificacoesUsuario.js";
import autentica from "./middlewares/auth.js";
import vendas from "./controllers/financeiro/vendas.js";
import despesas from "./controllers/financeiro/despesa.js";
import relatorios from "./controllers/financeiro/relatorios.js";
import relatorioEstoque from "./controllers/estoque/relatorios.js";
import upload from "./middlewares/uploadProdutos.js";

router.get("/usuarios", usuarios.getUsuarios);
router.post("/cadastro", usuarios.cadastro);
router.post("/login", usuarios.login);
router.post("/logout", autentica.autenticar, usuarios.logout);
router.put("/usuarios/:id", autentica.autenticar, usuarios.putUsuario);
router.delete(
  "/usuarios/:id",
  autentica.autenticar,
  verificaAdm,
  usuarios.desativarUsuario,
);

router.get("/fornecedores", fornecedores.getFornecedores);
router.post("/fornecedores", fornecedores.postFornecedores);
router.put("/fornecedores/:id", fornecedores.putFornecedor);
router.delete("/fornecedores/:id", fornecedores.deleteFornecedor);

router.get("/compras", compras.getCompras);
router.get("/compras/fornecedor/:id", compras.getComprasFornecedor);
router.post("/compras", autentica.autenticar, compras.postCompra);
router.delete("/compras/:id", autentica.autenticar, compras.cancelarCompra);

router.get("/vendas", vendas.getVendas);
router.get(
  "/vendas/usuario/:id",
  autentica.autenticar,
  vendas.getVendasUsuario,
);
router.post("/vendas", autentica.autenticar, vendas.postVendas);
router.delete("/vendas/:id", autentica.autenticar, vendas.cancelarVenda);

router.get("/despesas", despesas.getDespesas);
router.post("/despesas", autentica.autenticar, despesas.postDespesas);
router.delete("/despesas/:id", autentica.autenticar, despesas.estornarDespesa);

router.get(
  "/relatorios/vendas",
  autentica.autenticar,
  verificaAdm,
  relatorios.getRelatorioVendas,
);
router.get(
  "/relatorios/estoque",
  autentica.autenticar,
  verificaAdm,
  relatorioEstoque.getRelatorioEstoque,
);
router.get(
  "/relatorios/despesas",
  autentica.autenticar,
  verificaAdm,
  relatorios.getRelatorioDespesas,
);

router.get("/notificacoes", autentica.autenticar, getNotificacoes);
router.get(
  "/notificacoes/nao-lidas/total",
  autentica.autenticar,
  getTotalNaoLidas,
);
router.patch("/notificacoes/:id/lida", autentica.autenticar, marcarComoLida);

router.get("/produtos", produtos.getProdutos);
router.get("/produtos/inativos", produtos.getProdutosInativos);
router.get("/produtos/historico/:id", produtos.getHistoricoPreco);
router.get("/produtos/alertas", produtos.getEstoqueAlertas);
router.post("/produtos", upload.single("imagem"), produtos.postProdutos);
router.put("/produtos/:id", autentica.autenticar, produtos.putProdutos);
router.put("/produtos/:id", produtos.alterarQuantidade);
router.delete("/produtos/:id", autentica.autenticar, produtos.deleteProdutos);
router.patch("/produtos/:id", autentica.autenticar, produtos.reativarProduto);

export default router;
