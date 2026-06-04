import Constants from "expo-constants";
import axios from "axios";
import type { CreateTodoPayload, Todo, UpdateTodoPayload } from "../types/todo";

// On a physical device, "localhost" resolves to the device itself.
// We extract the dev machine's LAN IP from the Metro bundler URI instead.
const hostUri = Constants.expoConfig?.hostUri ?? "localhost:8081";
const host = hostUri.split(":")[0];

const client = axios.create({
  baseURL: `http://${host}:3000`,
  headers: { "Content-Type": "application/json" },
});

export async function getTodos(): Promise<Todo[]> {
  const { data } = await client.get<Todo[]>("/todos");
  return data;
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  const { data } = await client.post<Todo>("/todos", payload);
  return data;
}

export async function updateTodo(id: string, payload: UpdateTodoPayload): Promise<Todo> {
  const { data } = await client.put<Todo>(`/todos/${id}`, payload);
  return data;
}

export async function deleteTodo(id: string): Promise<void> {
  await client.delete(`/todos/${id}`);
}
