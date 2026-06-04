import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Todo } from "../types/todo";

interface Props {
  todo: Todo;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onPress: (todo: Todo) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onPress }: Props) {
  const opacity = useRef(new Animated.Value(todo.is_completed ? 0.5 : 1)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: todo.is_completed ? 0.5 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [todo.is_completed]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(todo.id, todo.is_completed)}
        activeOpacity={0.7}
      >
        {todo.is_completed ? (
          <View style={styles.checkboxChecked}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        ) : (
          <View style={styles.checkboxUnchecked} />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.content} onPress={() => onPress(todo)} activeOpacity={0.6}>
        <Text
          style={[styles.title, todo.is_completed && styles.titleCompleted]}
          numberOfLines={2}
        >
          {todo.title}
        </Text>
        {todo.description ? (
          <Text style={styles.description} numberOfLines={1}>
            {todo.description}
          </Text>
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(todo.id)}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color="#CCCCCC" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxUnchecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D0D0D0",
  },
  checkboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#39FF14",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
    lineHeight: 20,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: "#AAAAAA",
  },
  description: {
    fontSize: 12,
    color: "#AAAAAA",
    lineHeight: 16,
  },
  deleteBtn: {
    padding: 4,
  },
});
