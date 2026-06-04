import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/todos", async (_, res) => {
    const todos = await prisma.todo.findMany();

    res.json(todos);
})


app.listen(3000, () => {
    console.log("Server is running on port 3000");
})