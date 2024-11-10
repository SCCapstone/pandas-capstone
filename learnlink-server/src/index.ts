import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

 
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.listen(2020, () => {
    console.log("server running on localhost:2020");
  });