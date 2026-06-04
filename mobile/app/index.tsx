import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddTodoFAB from "../components/AddTodoFAB";
import CalendarStrip from "../components/CalendarStrip";
import Header from "../components/Header";
import TodoDetailModal from "../components/TodoDetailModal";
import TodoItem from "../components/TodoItem";
import { deleteTodo, getTodos, updateTodo } from "../lib/api";
import type { Todo } from "../types/todo";

export default function TodayScreen() {
  const qc = useQueryClient();
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const { data: todos = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["todos"],
    queryFn: getTodos,
  });

  const pending = todos.filter((t) => !t.is_completed);
  const completed = todos.filter((t) => t.is_completed);
  const ordered = [...pending, ...completed];

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_completed }: { id: string; is_completed: boolean }) =>
      updateTodo(id, { is_completed: !is_completed }),
    onMutate: async ({ id, is_completed }) => {
      await qc.cancelQueries({ queryKey: ["todos"] });
      const prev = qc.getQueryData<Todo[]>(["todos"]);
      qc.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, is_completed: !is_completed } : t))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["todos"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["todos"] });
      const prev = qc.getQueryData<Todo[]>(["todos"]);
      qc.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.filter((t) => t.id !== id)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["todos"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const handleToggle = useCallback((id: string, is_completed: boolean) => {
    toggleMutation.mutate({ id, is_completed });
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, []);

  const handlePress = useCallback((todo: Todo) => {
    setSelectedTodo(todo);
  }, []);

  const renderItem = ({ item }: { item: Todo }) => (
    <TodoItem todo={item} onToggle={handleToggle} onDelete={handleDelete} onPress={handlePress} />
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✓</Text>
        <Text style={styles.emptyTitle}>All clear!</Text>
        <Text style={styles.emptySubtitle}>No tasks yet. Tap + to add one.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Header />
      <CalendarStrip />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#39FF14" />
        </View>
      ) : (
        <FlatList
          data={ordered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={ordered.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#39FF14"
              colors={["#39FF14"]}
            />
          }
        />
      )}

      <AddTodoFAB />
      <TodoDetailModal
        todo={selectedTodo}
        onClose={() => setSelectedTodo(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  list: {
    paddingBottom: 120,
  },
  emptyList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    color: "#39FF14",
    fontWeight: "700",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
