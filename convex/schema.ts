import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  habits: defineTable({
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    description: v.string(),
    targetFrequency: v.string(), // "daily", "weekly", etc.
    createdAt: v.number(),
  }),
  
  habitEntries: defineTable({
    habitId: v.id("habits"),
    completedAt: v.number(),
    date: v.string(), // YYYY-MM-DD format for easy querying
    notes: v.optional(v.string()),
  })
  .index("by_habit", ["habitId"])
  .index("by_date", ["date"])
  .index("by_habit_and_date", ["habitId", "date"]),
});