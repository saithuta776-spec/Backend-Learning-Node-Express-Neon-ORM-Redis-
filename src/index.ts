import express from "express";
import "dotenv/config";
import { app } from "./app.js";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Sever Running at : http://localhost:${PORT}`);
});
