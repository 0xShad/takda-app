import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTodoStore } from "../store/todoStore";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function Header() {
  const { selectedDate } = useTodoStore();

  const title = isToday(selectedDate)
    ? "Today"
    : `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`;

  const dayName = DAYS[selectedDate.getDay()];
  const month = MONTHS[selectedDate.getMonth()];
  const date = selectedDate.getDate();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.dot} />
      </View>
      <Text style={styles.subtitle}>
        {dayName}, {month} {date}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#39FF14",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#888888",
    marginTop: 2,
    fontWeight: "400",
  },
});
