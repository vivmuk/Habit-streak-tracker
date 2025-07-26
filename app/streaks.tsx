import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import HabitCalendar from "@/components/HabitCalendar";
import LoadingScreen from "@/components/LoadingScreen";

const { width } = Dimensions.get("window");

// Helper function to get local date string
function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Streaks() {
  const habits = useQuery(api.habits.getAllHabits);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const todayDate = getLocalDateString();

  if (habits === undefined) {
    return <LoadingScreen />;
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Streak Calendar</Text>
          
          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.monthText}>
              {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
            </Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {habits?.map((habit) => (
          <View key={habit._id} style={styles.habitSection}>
            <View style={styles.habitHeader}>
              <View style={[styles.habitIcon, { backgroundColor: habit.color }]}>
                <Text style={styles.iconText}>{habit.icon}</Text>
              </View>
              <View style={styles.habitInfo}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <HabitStreakStats habitId={habit._id} todayDate={todayDate} />
              </View>
            </View>
            
            <HabitCalendar 
              habitId={habit._id}
              selectedMonth={selectedMonth}
              habitColor={habit.color}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function HabitStreakStats({ habitId, todayDate }: { habitId: string; todayDate: string }) {
  const streakData = useQuery(api.habits.getStreakData, { habitId, todayDate });
  
  if (!streakData) {
    return <Text style={styles.streakText}>Loading...</Text>;
  }

  return (
    <View style={styles.streakStats}>
      <Text style={styles.streakText}>
        🔥 {streakData.currentStreak} current • 🏆 {streakData.longestStreak} best
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  habitSection: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  habitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  habitIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  streakStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
});