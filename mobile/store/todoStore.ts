import { create } from "zustand";

interface TodoStore {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
