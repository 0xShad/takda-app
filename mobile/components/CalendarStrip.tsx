import React, { useCallback, useEffect, useRef } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTodoStore } from "../store/todoStore";

const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];
const SCREEN_WIDTH = Dimensions.get("window").width;
const TOTAL_WEEKS = 104;
const INITIAL_WEEK_INDEX = 52; // current week sits here

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Pre-compute the start-of-week for each page
const today = new Date();
const baseWeekStart = startOfWeek(today);
const weekStarts: Date[] = Array.from({ length: TOTAL_WEEKS }, (_, i) =>
  addDays(baseWeekStart, (i - INITIAL_WEEK_INDEX) * 7)
);

interface WeekPageProps {
  weekStart: Date;
  selectedDate: Date;
  today: Date;
  onDayPress: (date: Date) => void;
}

const WeekPage = React.memo(function WeekPage({
  weekStart,
  selectedDate,
  today,
  onDayPress,
}: WeekPageProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <View style={styles.weekRow}>
      {days.map((day, idx) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);

        return (
          <TouchableOpacity
            key={idx}
            style={styles.dayWrapper}
            onPress={() => onDayPress(day)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayInitial,
                isToday && !isSelected && styles.dayInitialToday,
                isSelected && styles.dayInitialSelected,
              ]}
            >
              {DAY_INITIALS[day.getDay()]}
            </Text>

            <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}>
              <Text
                style={[
                  styles.dayNumber,
                  isToday && !isSelected && styles.dayNumberToday,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {day.getDate()}
              </Text>
            </View>

            {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export default function CalendarStrip() {
  const { selectedDate, setSelectedDate } = useTodoStore();
  const flatListRef = useRef<FlatList>(null);
  const todayRef = useRef(new Date());

  useEffect(() => {
    // Scroll to the week that contains selectedDate (without animation on mount)
    const diffMs = startOfWeek(selectedDate).getTime() - baseWeekStart.getTime();
    const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
    const targetIndex = INITIAL_WEEK_INDEX + diffWeeks;
    flatListRef.current?.scrollToIndex({ index: targetIndex, animated: false });
  }, []);

  const onDayPress = useCallback(
    (date: Date) => setSelectedDate(date),
    [setSelectedDate]
  );

  const renderItem = useCallback(
    ({ item }: { item: Date }) => (
      <WeekPage
        weekStart={item}
        selectedDate={selectedDate}
        today={todayRef.current}
        onDayPress={onDayPress}
      />
    ),
    [selectedDate, onDayPress]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={weekStarts}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialScrollIndex={INITIAL_WEEK_INDEX}
        windowSize={5}
        maxToRenderPerBatch={3}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    paddingVertical: 10,
  },
  weekRow: {
    width: SCREEN_WIDTH,
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  dayWrapper: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  dayInitial: {
    fontSize: 11,
    fontWeight: "500",
    color: "#AAAAAA",
  },
  dayInitialToday: {
    color: "#39FF14",
  },
  dayInitialSelected: {
    color: "#FFFFFF",
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleSelected: {
    backgroundColor: "#39FF14",
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  dayNumberToday: {
    color: "#39FF14",
    fontWeight: "700",
  },
  dayNumberSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#39FF14",
    marginTop: -2,
  },
  todayDotSelected: {
    backgroundColor: "#FFFFFF",
  },
});
