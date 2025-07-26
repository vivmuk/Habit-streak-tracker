import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const { width } = Dimensions.get("window");
const daySize = (width - 60) / 7; // Better spacing calculation

interface HabitCalendarProps {
  habitId: string;
  selectedMonth: Date;
  habitColor: string;
}

export default function HabitCalendar({ habitId, selectedMonth, habitColor }: HabitCalendarProps) {
  const habitEntries = useQuery(api.habits.getHabitEntries, { habitId });

  if (!habitEntries) {
    return <Text>Loading calendar...</Text>;
  }

  // Create a set of completed dates for quick lookup
  const completedDates = new Set(habitEntries.map(entry => entry.date));

  // Get calendar data for the selected month
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Create array of all days to display
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isCompleted = completedDates.has(dateString);
    const isToday = isDateToday(year, month, day);
    
    calendarDays.push({
      day,
      dateString,
      isCompleted,
      isToday,
    });
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.calendar}>
      {/* Week day headers */}
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={[styles.dayHeader, { width: daySize }]}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((dayData, index) => (
          <View key={index} style={[styles.dayCell, { width: daySize, height: daySize }]}>
            {dayData && (
              <View
                style={[
                  styles.dayContent,
                  dayData.isCompleted && { backgroundColor: habitColor },
                  dayData.isToday && styles.todayBorder,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    dayData.isCompleted && styles.completedDayText,
                    dayData.isToday && !dayData.isCompleted && styles.todayText,
                  ]}
                >
                  {dayData.day}
                </Text>
                {dayData.isCompleted && (
                  <View style={styles.completedIndicator}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function isDateToday(year: number, month: number, day: number): boolean {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  );
}

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dayHeader: {
    alignItems: "center",
    paddingVertical: 8,
    width: daySize,
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    width: daySize,
    height: daySize,
  },
  dayContent: {
    width: daySize - 6,
    height: daySize - 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "transparent",
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: "#667eea",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  completedDayText: {
    color: "white",
    fontWeight: "bold",
  },
  todayText: {
    color: "#667eea",
    fontWeight: "bold",
  },
  completedIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },
});