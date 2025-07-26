import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const { width } = Dimensions.get("window");
const calendarWidth = width - 40; // Account for padding
const daySize = (calendarWidth - 14) / 7; // 7 days, account for gaps

interface CombinedHabitCalendarProps {
  selectedMonth: Date;
  habits: any[];
}

export default function CombinedHabitCalendar({ selectedMonth, habits }: CombinedHabitCalendarProps) {
  const todayDate = getLocalDateString();

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
    const isToday = isDateToday(year, month, day);
    
    // Get completion status for each habit on this day
    const habitCompletions = habits.map(habit => {
      const habitEntries = useQuery(api.habits.getHabitEntries, { habitId: habit._id });
      const completedDates = new Set(habitEntries?.map(entry => entry.date) || []);
      return {
        habitId: habit._id,
        habitColor: habit.color,
        isCompleted: completedDates.has(dateString),
      };
    });
    
    calendarDays.push({
      day,
      dateString,
      isToday,
      habitCompletions,
    });
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.container}>
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
              <View style={[styles.dayContent, dayData.isToday && styles.todayBorder]}>
                <Text style={[styles.dayText, dayData.isToday && styles.todayText]}>
                  {dayData.day}
                </Text>
                
                {/* Habit completion indicators */}
                <View style={styles.habitIndicators}>
                  {dayData.habitCompletions.map((completion, habitIndex) => (
                    <View
                      key={completion.habitId}
                      style={[
                        styles.habitIndicator,
                        { backgroundColor: completion.isCompleted ? completion.habitColor : 'transparent' },
                        { borderColor: completion.habitColor }
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Habits:</Text>
        <View style={styles.legendItems}>
          {habits.map((habit, index) => (
            <View key={habit._id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: habit.color }]} />
              <Text style={styles.legendText}>{habit.name}</Text>
            </View>
          ))}
        </View>
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

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dayHeader: {
    alignItems: "center",
    paddingVertical: 8,
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
  },
  dayContent: {
    width: daySize - 4,
    height: daySize - 4,
    borderRadius: 8,
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    backgroundColor: "transparent",
    padding: 4,
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: "#667eea",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  todayText: {
    color: "#667eea",
    fontWeight: "bold",
  },
  habitIndicators: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 2,
    marginTop: 2,
  },
  habitIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
  legend: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
}); 