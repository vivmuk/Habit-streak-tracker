import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL || "https://cool-bulldog-876.convex.cloud", {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarActiveTintColor: "#667eea",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Today",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="today" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="streaks"
          options={{
            title: "Streaks",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flame" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ConvexProvider>
  );
}