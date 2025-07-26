import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllHabits = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("habits").order("desc").collect();
  },
});

export const getHabitEntries = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habitEntries")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .order("desc")
      .collect();
  },
});

export const getTodayEntries = query({
  args: { todayDate: v.string() }, // Pass the local date from client
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habitEntries")
      .withIndex("by_date", (q) => q.eq("date", args.todayDate))
      .collect();
  },
});

export const getStreakData = query({
  args: { habitId: v.id("habits"), todayDate: v.string() },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .order("desc")
      .collect();
    
    if (entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
    }

    // Calculate current streak using local date
    let currentStreak = 0;
    const todayStr = args.todayDate;
    
    // Check if completed today
    const completedToday = entries.some(entry => entry.date === todayStr);
    
    if (completedToday) {
      currentStreak = 1;
      
      // Count consecutive days backwards
      for (let i = 1; i < 365; i++) {
        const checkDate = new Date(args.todayDate);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        const completedOnDate = entries.some(entry => entry.date === checkDateStr);
        if (completedOnDate) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    const sortedDates = [...new Set(entries.map(e => e.date))].sort();
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      totalCompletions: entries.length,
    };
  },
});

export const completeHabit = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(), // Pass the local date from client
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already completed on this date
    const existingEntry = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_and_date", (q) => 
        q.eq("habitId", args.habitId).eq("date", args.date)
      )
      .first();
    
    if (existingEntry) {
      throw new Error("Habit already completed today");
    }
    
    return await ctx.db.insert("habitEntries", {
      habitId: args.habitId,
      completedAt: Date.now(),
      date: args.date,
      notes: args.notes,
    });
  },
});

export const uncompleteHabit = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(), // Pass the local date from client
  },
  handler: async (ctx, args) => {
    const existingEntry = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_and_date", (q) => 
        q.eq("habitId", args.habitId).eq("date", args.date)
      )
      .first();
    
    if (existingEntry) {
      await ctx.db.delete(existingEntry._id);
    }
  },
});

export const initializeHabits = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if habits already exist
    const existingHabits = await ctx.db.query("habits").collect();
    if (existingHabits.length > 0) {
      return existingHabits;
    }

    const defaultHabits = [
      {
        name: "Meditation",
        icon: "🧘‍♂️",
        color: "#6366F1",
        description: "Daily mindfulness practice",
        targetFrequency: "daily",
        createdAt: Date.now(),
      },
      {
        name: "Daily Impact Stories",
        icon: "✍️",
        color: "#F59E0B",
        description: "Creative writing session",
        targetFrequency: "daily",
        createdAt: Date.now(),
      },
      {
        name: "Critical Thinking",
        icon: "🧠",
        color: "#10B981",
        description: "Analytical thinking exercises",
        targetFrequency: "daily",
        createdAt: Date.now(),
      },
      {
        name: "Supplements",
        icon: "💊",
        color: "#EF4444",
        description: "Daily supplement routine",
        targetFrequency: "daily",
        createdAt: Date.now(),
      },
      {
        name: "Log Food",
        icon: "🍎",
        color: "#8B5CF6",
        description: "Track daily nutrition",
        targetFrequency: "daily",
        createdAt: Date.now(),
      },
    ];

    const createdHabits = [];
    for (const habit of defaultHabits) {
      const id = await ctx.db.insert("habits", habit);
      createdHabits.push({ ...habit, _id: id });
    }
    
    return createdHabits;
  },
});