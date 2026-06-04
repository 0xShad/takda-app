import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "./BottomSheet";
import { createTodo } from "../lib/api";

export default function AddTodoFAB() {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const qc = useQueryClient();

  const reset = () => {
    setTitle("");
    setDescription("");
  };

  const mutation = useMutation({
    mutationFn: () =>
      createTodo({ title: title.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      reset();
      setVisible(false);
    },
  });

  const handleClose = () => {
    reset();
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <BottomSheet visible={visible} onClose={handleClose}>
        <View style={styles.content}>
          <Text style={styles.sheetTitle}>New Task</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor="#AAA"
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Add some details... (optional)"
              placeholderTextColor="#AAA"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !title.trim() && styles.submitBtnDisabled]}
            onPress={() => mutation.mutate()}
            disabled={!title.trim() || mutation.isPending}
            activeOpacity={0.85}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitText}>Add Task</Text>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#39FF14",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#39FF14",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  fieldGroup: {
    gap: 8,
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
    paddingVertical: 13,
    fontSize: 15,
    color: "#1A1A1A",
    backgroundColor: "#FAFAFA",
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: "#39FF14",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#39FF14",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: "#D0D0D0",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
