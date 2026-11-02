import express from "express";
import cors from "cors";
import routes from "routes.js";

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGINS ?? process.env.CORS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
  }),
);

app.use(routes);

export default app;
