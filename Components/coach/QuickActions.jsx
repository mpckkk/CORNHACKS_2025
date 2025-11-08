import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Zap, TrendingUp, Dumbbell, Brain, Calendar, Apple, Droplet } from "lucide-react";
import { motion } from "framer-motion";

const quickActions = [
  {
    icon: Target,
    label: "Personalized Plan",
    prompt: "Based on my current fitness level, workout history, and nutrition data, create a comprehensive personalized plan for me. My goal is to improve overall fitness and health.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    label: "Workout Recommendation",
    prompt: "Analyze my recent workout history and recommend what type of workout I should do next to balance my training.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Apple,
    label: "Meal Plan",
    prompt: "Create a personalized meal plan for me based on my fitness goals, workout routine, and dietary preferences. Include calorie and macro targets.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: TrendingUp,
    label: "Progress Analysis",
    prompt: "Analyze my overall progress including workouts and nutrition. What am I doing well? Where can I improve? Give me actionable insights.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Dumbbell,
    label: "Form Tips",
    prompt: "Give me detailed form correction tips for common exercises like push-ups, squats, and planks. What are the most common mistakes?",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Brain,
    label: "Nutrition Advice",
    prompt: "Based on my meal logs and workout routine, analyze my nutrition. Am I eating enough? What should I adjust? Give me specific recommendations.",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Droplet,
    label: "Hydration Strategy",
    prompt: "Analyze my water intake and workout intensity. Am I drinking enough water? When should I hydrate more? Give me a hydration strategy.",
    color: "from-cyan-500 to-blue-500"
  },
  {
    icon: Calendar,
    label: "Weekly Schedule",
    prompt: "Create a balanced weekly workout and meal schedule for me considering my current fitness level and nutrition goals. Include rest days and meal timing.",
    color: "from-pink-500 to-rose-500"
  }
];

export default function QuickActions({ onSelect }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-6xl">
      {quickActions.map((action, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer h-full"
            onClick={() => onSelect(action.prompt)}
          >
            <CardContent className="p-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {action.label}
              </h3>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}