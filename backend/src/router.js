import { Router } from "express";
const router = Router();
import produtos from "./controllers/produtos.js";
import upload from "./middlewares/uploadProdutos.js";

router.post(
  "/produtos",
  upload.single("imagem"),
  produtos.postProdutos,
);
export default router;
