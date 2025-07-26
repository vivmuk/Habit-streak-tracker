import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

interface Habit {
  _id: Id<"habits">;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onPress: () => void;
}

export default function HabitCard({ habit, isCompleted, onPress }: HabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const completeHabit = useMutation(api.habits.completeHabit);
  const uncompleteHabit = useMutation(api.habits.uncompleteHabit);
  const streakData = useQuery(api.habits.getStreakData, { habitId: habit._id });
  
  const scaleAnim = new Animated.Value(1);

  const handlePress = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    onPress();

    // Haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(
        isCompleted 
          ? Haptics.ImpactFeedbackStyle.Light 
          : Haptics.ImpactFeedbackStyle.Heavy
      );
    }

    // Animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (isCompleted) {
        await uncompleteHabit({ habitId: habit._id });
      } else {
        await completeHabit({ habitId: habit._id });
      }
    } catch (error) {
      console.error("Error updating habit:", error);
    } finally {
      setIsAnimating(false);
    }
  };

  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.card,
          isCompleted && styles.completedCard,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            isCompleted
              ? [habit.color, `${habit.color}CC`]
              : ["#FFFFFF", "#F8FAFC"]
          }
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: habit.color }]}>
              <Text style={styles.icon}>{habit.icon}</Text>
            </View>
            <View style={styles.checkContainer}>
              {isCompleted ? (
                <View style={[styles.checkmark, { backgroundColor: habit.color }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              ) : (
                <View style={styles.unchecked} />
              )}
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={[styles.habitName, isCompleted && styles.completedText]}>
              {habit.name}
            </Text>
            <Text style={[styles.habitDescription, isCompleted && styles.completedDescription]}>
              {habit.description}
            </Text>
          </View>

          <View style={styles.streakContainer}>
            <View style={styles.streakItem}>
              <Text style={[styles.streakNumber, isCompleted && styles.completedText]}>
                {currentStreak}
              </Text>
              <Text style={[styles.streakLabel, isCompleted && styles.completedDescription]}>
                Current
              </Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Text style={[styles.streakNumber, isCompleted && styles.completedText]}>
                {longestStreak}
              </Text>
              <Text style={[styles.streakLabel, isCompleted && styles.completedDescription]}>
                Best
              </Text>
            </View>
          </View>

          {currentStreak > 0 && (
            <View style={styles.fireContainer}>
              <Text style={styles.fireEmoji}>🔥</Text>
              <Text style={[styles.fireText, isCompleted && styles.completedDescription]}>
                {currentStreak} day streak!
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  completedCard: {
    shadowColor: "#10B981",
    shadowOpacity: 0.2,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
  },
  checkContainer: {
    width: 32,
    height: 32,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  unchecked: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  cardContent: {
    marginBottom: 16,
  },
  habitName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  completedText: {
    color: "white",
  },
  habitDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  completedDescription: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 12,
    marginBottom: 12,
  },
  streakItem: {
    alignItems: "center",
    flex: 1,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  streakLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  streakDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#D1D5DB",
  },
  fireContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fireEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  fireText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
  },
});