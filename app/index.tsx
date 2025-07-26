import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import CompactHabitCard from "@/components/CompactHabitCard";
import LoadingScreen from "@/components/LoadingScreen";

const { width, height } = Dimensions.get("window");

// Helper function to get local date string
function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Index() {
  const habits = useQuery(api.habits.getAllHabits);
  const todayDate = getLocalDateString();
  const todayEntries = useQuery(api.habits.getTodayEntries, { todayDate });
  const initializeHabits = useMutation(api.habits.initializeHabits);

  useEffect(() => {
    if (habits && habits.length === 0) {
      initializeHabits();
    }
  }, [habits]);

  if (habits === undefined || todayEntries === undefined) {
    return <LoadingScreen />;
  }

  const completedToday = todayEntries?.length || 0;
  const totalHabits = habits?.length || 0;
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  const handleHapticFeedback = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Good {getTimeOfDay()}! 👋</Text>
          <Text style={styles.title}>V's Habit Tracker 2025</Text>
          
          {/* Progress Overview */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStats}>
              <Text style={styles.progressNumber}>{completedToday}/{totalHabits}</Text>
              <Text style={styles.progressLabel}>Completed Today</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={["#10B981", "#34D399"]}
                  style={[styles.progressBarFill, { width: `${completionRate}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
            
            {completionRate === 100 && totalHabits > 0 && (
              <Text style={styles.perfectDayText}>🏆 Perfect Day!</Text>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.habitsGrid}>
          {habits?.map((habit) => {
            const isCompleted = todayEntries?.some(
              (entry) => entry.habitId === habit._id
            );
            return (
              <CompactHabitCard
                key={habit._id}
                habit={habit}
                isCompleted={isCompleted || false}
                onPress={handleHapticFeedback}
                todayDate={todayDate}
              />
            );
          })}
        </View>

        {completedToday === totalHabits && totalHabits > 0 && (
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>Amazing Work!</Text>
            <Text style={styles.celebrationText}>
              All habits completed today. You're building something incredible!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  progressContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  progressStats: {
    alignItems: "center",
    marginBottom: 16,
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  progressLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  progressBarContainer: {
    width: "100%",
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  perfectDayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FCD34D",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  habitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  celebrationCard: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 20,
  },
  celebrationEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  celebrationText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});