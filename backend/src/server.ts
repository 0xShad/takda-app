import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/todos", async (_req: Request, res: Response) => {
  const todos = await prisma.todo.findMany({ orderBy: { created_at: "desc" } });
  res.json(todos);
});

app.post("/todos", async (req: Request, res: Response) => {
  const { title, description } = req.body ?? {};

  if (!title || typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ error: "title is required and must be a non-empty string" });
    return;
  }

  const todo = await prisma.todo.create({
    data: {
      title: title.trim(),
      description: typeof description === "string" ? description : null,
    },
  });
  res.status(201).json(todo);
});

app.get("/todos/:id", async (req: Request, res: Response) => {
  const todo = await prisma.todo.findUnique({ where: { id: req.params.id } });
  if (!todo) {
    res.status(404).json({ error: `Todo "${req.params.id}" not found` });
    return;
  }
  res.json(todo);
});

app.put("/todos/:id", async (req: Request, res: Response) => {
  const { title, description, is_completed } = req.body ?? {};

  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    res.status(400).json({ error: "title must be a non-empty string" });
    return;
  }
  if (is_completed !== undefined && typeof is_completed !== "boolean") {
    res.status(400).json({ error: "is_completed must be a boolean" });
    return;
  }

  const data: Record<string, string | boolean | null> = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description ?? null;
  if (is_completed !== undefined) data.is_completed = is_completed;

  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: "No fields provided to update" });
    return;
  }

  try {
    const todo = await prisma.todo.update({ where: { id: req.params.id }, data });
    res.json(todo);
  } catch (err: any) {
    if (err?.code === "P2025") {
      res.status(404).json({ error: `Todo "${req.params.id}" not found` });
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
      res.status(404).json({ error: `Todo "${req.params.id}" not found` });
      return;
    }
    throw err;
  }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON in request body" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
