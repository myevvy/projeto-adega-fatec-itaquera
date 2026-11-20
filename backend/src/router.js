// router.js
import { Router } from "express";
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
import authController from "./controllers/authController.js";
import categoriasProdutos from "./controllers/estoque/categorias.js";
import categoriasDespesas from "./controllers/financeiro/categorias.js";
import estabelecimento from "./controllers/estabelecimento.js";

const router = Router();

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/esqueci-senha', authController.esqueciSenha);

router.get(
  "/usuarios",
  autentica.autenticar,
  verificaAdm,
  usuarios.getUsuarios,
);
router.post("/cadastro", autentica.autenticar, verificaAdm, usuarios.cadastro);
router.post("/login", usuarios.login);
router.post("/logout", autentica.autenticar, usuarios.logout);
router.put("/usuarios/:id", autentica.autenticar, usuarios.putUsuario);
router.delete(
  "/usuarios/:id",
  autentica.autenticar,
  verificaAdm,
  usuarios.desativarUsuario,
);

router.get("/fornecedores", autentica.autenticar, fornecedores.getFornecedores);
router.post(
  "/fornecedores",
  autentica.autenticar,
  fornecedores.postFornecedores,
);
router.put(
  "/fornecedores/:id",
  autentica.autenticar,
  fornecedores.putFornecedor,
);
router.delete(
  "/fornecedores/:id",
  autentica.autenticar,
  fornecedores.deleteFornecedor,
);

router.get("/compras", autentica.autenticar, compras.getCompras);
router.get(
  "/compras/fornecedor/:id",
  autentica.autenticar,
  compras.getComprasFornecedor,
);
router.post("/compras", autentica.autenticar, compras.postCompra);
router.delete("/compras/:id", autentica.autenticar, compras.cancelarCompra);

router.get("/vendas", autentica.autenticar, vendas.getVendas);
router.get(
  "/vendas/usuario/:id",
  autentica.autenticar,
  vendas.getVendasUsuario,
);
router.post("/vendas", autentica.autenticar, vendas.postVendas);
router.delete("/vendas/:id", autentica.autenticar, vendas.cancelarVenda);

router.get("/despesas", autentica.autenticar, despesas.getDespesas);
router.post("/despesas", autentica.autenticar, despesas.postDespesas);
router.delete("/despesas/:id", autentica.autenticar, despesas.estornarDespesa);
router.get(
  "/estabelecimento",
  autentica.autenticar,
  verificaAdm,
  estabelecimento.getEstabelecimento,
);
router.put(
  "/estabelecimento",
  autentica.autenticar,
  verificaAdm,
  estabelecimento.putEstabelecimento,
);
router.get(
  "/categorias/despesas",
  autentica.autenticar,
  categoriasDespesas.getCategorias,
);
router.post(
  "/categorias/despesas",
  autentica.autenticar,
  verificaAdm,
  categoriasDespesas.postCategoria,
);

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

router.get("/produtos", autentica.autenticar, produtos.getProdutos);
router.get(
  "/categorias/produtos",
  autentica.autenticar,
  categoriasProdutos.getCategorias,
);
router.post(
  "/categorias/produtos",
  autentica.autenticar,
  verificaAdm,
  categoriasProdutos.postCategoria,
);
router.get(
  "/produtos/inativos",
  autentica.autenticar,
  produtos.getProdutosInativos,
);
router.get(
  "/produtos/historico/:id",
  autentica.autenticar,
  produtos.getHistoricoPreco,
);
router.get(
  "/produtos/alertas",
  autentica.autenticar,
  produtos.getEstoqueAlertas,
);
router.post("/produtos", upload.single("imagem"), produtos.postProdutos);
router.put("/produtos/:id", autentica.autenticar, produtos.putProdutos);
router.put(
  "/produtos/quantidade/:id",
  autentica.autenticar,
  produtos.alterarQuantidade,
);
router.delete("/produtos/:id", autentica.autenticar, produtos.deleteProdutos);
router.patch("/produtos/:id", autentica.autenticar, produtos.reativarProduto);

export default router;