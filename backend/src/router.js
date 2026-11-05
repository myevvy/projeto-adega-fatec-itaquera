import { Router } from "express";
const router = Router();
import produtos from "./controllers/produtos.js";
import usuarios from "./controllers/usuarios.js";
import fornecedores from "./controllers/fornecedores.js";
import compras from "./controllers/compra.js";
import upload from "./middlewares/uploadProdutos.js";

router.get('/usuarios', usuarios.getUsuarios);
router.post('/cadastro', usuarios.cadastro);
router.post('/login', usuarios.login);
router.put('/usuarios/:id', usuarios.putUsuario);
router.delete('/usuarios/:id', usuarios.desativarUsuario);

router.get('/fornecedores', fornecedores.getFornecedores);
router.post('/fornecedores', fornecedores.postFornecedores);
router.put('/fornecedores/:id', fornecedores.putFornecedor);
router.delete('/fornecedores/:id', fornecedores.deleteFornecedor);

router.get('/compras', compras.getCompras);
router.get('/compras', compras.getComprasFornecedor);
router.post('/compras/:id', compras.postCompra);
router.delete('/compras/:id', compras.cancelarCompra);

router.post(
  "/produtos",
  upload.single("imagem"),
  produtos.postProdutos,
);
export default router;
