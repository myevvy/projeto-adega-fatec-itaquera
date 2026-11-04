import { Router } from "express";
const router = Router();
import produtos from "./controllers/produtos.js";
import usuarios from "./controllers/usuarios.js";
import upload from "./middlewares/uploadProdutos.js";

router.post('/cadastro', usuarios.cadastro);
router.post('/login', usuarios.login);
router.put('/usuarios/:id', usuarios.putUsuario);
router.delete('/usuarios/:id', usuarios.desativarUsuario);

router.post(
  "/produtos",
  upload.single("imagem"),
  produtos.postProdutos,
);
export default router;
