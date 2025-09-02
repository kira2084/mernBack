import express from "express";
import cors from "cors";
import userRoutes from "./routers/userRoutes.js";
// import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", userRoutes);

export default app;
