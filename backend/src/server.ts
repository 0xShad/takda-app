import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/todos", async (_req: Request, res: Response) => {
  const todos = await prisma.todo.findMany();
  res.json(todos);
});

app.post("/todos", async (req: Request, res: Response) => {
  const { title, description } = req.body as { title: string; description?: string };
  const todo = await prisma.todo.create({ data: { title, description: description ?? null } });
  res.status(201).json(todo);
});

app.get("/todos/:id", async (req: Request, res: Response) => {
  const todo = await prisma.todo.findUnique({ where: { id: req.params.id } });
  if (!todo) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(todo);
});

app.put("/todos/:id", async (req: Request, res: Response) => {
  const { title, description, is_completed } = req.body as {
    title?: string;
    description?: string;
    is_completed?: boolean;
  };
  const data: Record<string, string | boolean | null> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description ?? null;
  if (is_completed !== undefined) data.is_completed = is_completed;
  try {
    const todo = await prisma.todo.update({ where: { id: req.params.id }, data });
    res.json(todo);
  } catch (err: any) {
    if (err?.code === "P2025") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    throw err;
  }
});

app.delete("/todos/:id", async (req: Request, res: Response) => {
  try {
    await prisma.todo.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    if (err?.code === "P2025") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    throw err;
  }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? "Internal server error" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
