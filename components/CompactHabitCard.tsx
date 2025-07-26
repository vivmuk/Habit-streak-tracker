import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const cardWidth = (width - 76) / 2; // Adjusted for 5 habits in 2 columns with proper spacing

interface Habit {
  _id: Id<"habits">;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface CompactHabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onPress: () => void;
  todayDate: string;
}

export default function CompactHabitCard({ habit, isCompleted, onPress, todayDate }: CompactHabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const completeHabit = useMutation(api.habits.completeHabit);
  const uncompleteHabit = useMutation(api.habits.uncompleteHabit);
  const streakData = useQuery(api.habits.getStreakData, { 
    habitId: habit._id, 
    todayDate 
  });
  
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
        await uncompleteHabit({ habitId: habit._id, date: todayDate });
      } else {
        await completeHabit({ habitId: habit._id, date: todayDate });
      }
    } catch (error) {
      console.error("Error updating habit:", error);
    } finally {
      setIsAnimating(false);
    }
  };

  const currentStreak = streakData?.currentStreak || 0;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.card,
          { width: cardWidth },
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
          {/* Header with icon and checkmark */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: isCompleted ? "rgba(255,255,255,0.2)" : habit.color }]}>
              <Text style={styles.icon}>{habit.icon}</Text>
            </View>
            <View style={styles.checkContainer}>
              {isCompleted ? (
                <View style={[styles.checkmark, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              ) : (
                <View style={styles.unchecked} />
              )}
            </View>
          </View>

          {/* Habit name */}
          <Text style={[styles.habitName, isCompleted && styles.completedText]} numberOfLines={2}>
            {habit.name}
          </Text>

          {/* Streak indicator */}
          {currentStreak > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.fireEmoji}>🔥</Text>
              <Text style={[styles.streakText, isCompleted && styles.completedDescription]}>
                {currentStreak}
              </Text>
            </View>
          )}

          {/* Status indicator */}
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, isCompleted && styles.completedDescription]}>
              {isCompleted ? "Completed!" : "Tap to complete"}
            </Text>
          </View>
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
    marginBottom: 12,
  },
  completedCard: {
    shadowColor: "#10B981",
    shadowOpacity: 0.2,
  },
  cardGradient: {
    padding: 12,
    minHeight: 140,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
  },
  checkContainer: {
    width: 24,
    height: 24,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  unchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  habitName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 6,
    lineHeight: 18,
  },
  completedText: {
    color: "white",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  fireEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#F59E0B",
  },
  statusContainer: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  completedDescription: {
    color: "rgba(255, 255, 255, 0.8)",
  },
});