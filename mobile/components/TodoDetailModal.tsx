import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "./BottomSheet";
import { updateTodo } from "../lib/api";
import type { Todo } from "../types/todo";

interface Props {
  todo: Todo | null;
  onClose: () => void;
}

export default function TodoDetailModal({ todo, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description ?? "");
      setIsCompleted(todo.is_completed);
    }
  }, [todo]);

  const mutation = useMutation({
    mutationFn: () =>
      updateTodo(todo!.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        is_completed: isCompleted,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      onClose();
    },
  });

  const hasChanges =
    todo &&
    (title.trim() !== todo.title ||
      (description.trim() || undefined) !== (todo.description || undefined) ||
      isCompleted !== todo.is_completed);

  if (!todo) return null;

  return (
    <BottomSheet visible={!!todo} onClose={onClose}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sheetTitle}>Task Details</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={22} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Completion toggle */}
      <TouchableOpacity
        style={styles.completionRow}
        onPress={() => setIsCompleted((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkCircle, isCompleted && styles.checkCircleDone]}>
          {isCompleted && <Ionicons name="checkmark" size={14} color="#FFF" />}
        </View>
        <Text style={[styles.completionLabel, isCompleted && styles.completionLabelDone]}>
          {isCompleted ? "Completed" : "Mark as complete"}
        </Text>
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
          placeholderTextColor="#AAA"
          returnKeyType="next"
        />
      </View>

      {/* Description */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor="#AAA"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, (!hasChanges || !title.trim()) && styles.saveBtnDisabled]}
        onPress={() => mutation.mutate()}
        disabled={!hasChanges || !title.trim() || mutation.isPending}
        activeOpacity={0.85}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.saveBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      {mutation.isError && (
        <Text style={styles.errorText}>Failed to save. Please try again.</Text>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  completionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleDone: {
    backgroundColor: "#39FF14",
    borderColor: "#39FF14",
  },
  completionLabel: {
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
  completionLabelDone: {
    color: "#39FF14",
    fontWeight: "600",
  },
  fieldGroup: {
    gap: 6,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1A1A",
    backgroundColor: "#FAFAFA",
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#39FF14",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 4,
    shadowColor: "#39FF14",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: "#D0D0D0",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
