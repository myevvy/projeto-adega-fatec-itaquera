import { mkdir } from "fs";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const diretorioUploads = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../uploads/produtos",
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    mkdir(diretorioUploads, { recursive: true }, (erro) => {
      cb(erro, diretorioUploads);
    });
  },

  filename: (req, file, cb) => {
    const nome = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, nome);
  },
});

const upload = multer({ storage });

export default upload;