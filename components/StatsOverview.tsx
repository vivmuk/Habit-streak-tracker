import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface StatsOverviewProps {
  completedToday: number;
  totalHabits: number;
  completionRate: number;
}

export default function StatsOverview({
  completedToday,
  totalHabits,
  completionRate,
}: StatsOverviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedToday}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalHabits}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{Math.round(completionRate)}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
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
        <View style={styles.perfectDayBadge}>
          <Text style={styles.perfectDayText}>🏆 Perfect Day!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginTop: 2,
  },
  progressBarContainer: {
    marginBottom: 8,
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
  perfectDayBadge: {
    alignItems: "center",
    marginTop: 8,
  },
  perfectDayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FCD34D",
  },
});