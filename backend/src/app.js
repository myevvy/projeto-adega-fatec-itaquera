import express from "express";
import cors from "cors";
import router from "./router.js";
import path from "path";

const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.resolve("uploads")));

const allowedOrigins = (process.env.CORS_ORIGINS ?? process.env.CORS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
  }),
);

app.use(router);

export default app;
