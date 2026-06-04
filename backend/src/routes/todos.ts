import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const todos = await prisma.todo.findMany({ orderBy: { created_at: "desc" } });
  res.json(todos);
});

router.post("/", async (req: Request, res: Response) => {
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

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo) {
    res.status(404).json({ error: `Todo "${id}" not found` });
    return;
  }
  res.json(todo);
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
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
    const todo = await prisma.todo.update({ where: { id }, data });
    res.json(todo);
  } catch (err: any) {
    if (err?.code === "P2025") {
      res.status(404).json({ error: `Todo "${id}" not found` });
      return;
    }
    throw err;
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    await prisma.todo.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err?.code === "P2025") {
      res.status(404).json({ error: `Todo "${id}" not found` });
      return;
    }
    throw err;
  }
});

export default router;
