import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, Trophy, Zap, Calendar, Target, Users, Star } from "lucide-react";
import { motion } from "framer-motion";

const ACHIEVEMENT_TEMPLATES = [
  { title: "First Steps", description: "Complete your first workout", icon: "Trophy", requirement: "1 workout", category: "workouts", threshold: 1, color: "from-green-400 to-emerald-500" },
  { title: "Getting Started", description: "Complete 5 workouts", icon: "Zap", requirement: "5 workouts", category: "workouts", threshold: 5, color: "from-blue-400 to-cyan-500" },
  { title: "Fitness Enthusiast", description: "Complete 10 workouts", icon: "Target", requirement: "10 workouts", category: "workouts", threshold: 10, color: "from-purple-400 to-pink-500" },
  { title: "Dedicated Warrior", description: "Complete 25 workouts", icon: "Star", requirement: "25 workouts", category: "workouts", threshold: 25, color: "from-orange-400 to-red-500" },
  { title: "Fitness Legend", description: "Complete 50 workouts", icon: "Sparkles", requirement: "50 workouts", category: "workouts", threshold: 50, color: "from-yellow-400 to-orange-500" },
  { title: "On Fire", description: "Maintain a 3-day streak", icon: "Zap", requirement: "3-day streak", category: "streaks", threshold: 3, color: "from-orange-500 to-red-500" },
  { title: "Unstoppable", description: "Maintain a 7-day streak", icon: "Trophy", requirement: "7-day streak", category: "streaks", threshold: 7, color: "from-red-500 to-pink-500" },
  { title: "Committed Champion", description: "Maintain a 14-day streak", icon: "Star", requirement: "14-day streak", category: "streaks", threshold: 14, color: "from-purple-500 to-pink-500" },
  { title: "Challenge Accepted", description: "Complete an Advanced quest", icon: "Target", requirement: "1 advanced workout", category: "difficulty", threshold: 1, color: "from-indigo-400 to-purple-500" },
  { title: "Legendary Hero", description: "Complete a Legendary quest", icon: "Sparkles", requirement: "1 legendary workout", category: "difficulty", threshold: 1, color: "from-purple-500 to-pink-600" },
];

const iconMap = {
  Trophy, Zap, Target, Star, Sparkles, Calendar, Users
};

export default function Achievements() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list(),
    initialData: [],
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  // Calculate which achievements are unlocked
  const achievements = ACHIEVEMENT_TEMPLATES.map(template => {
    let isUnlocked = false;
    
    if (template.category === "workouts") {
      isUnlocked = workouts.length >= template.threshold;
    } else if (template.category === "streaks") {
      isUnlocked = (user?.current_streak || 0) >= template.threshold || (user?.longest_streak || 0) >= template.threshold;
    } else if (template.category === "difficulty") {
      if (template.requirement.includes("advanced")) {
        isUnlocked = workouts.some(w => w.difficulty === "advanced");
      } else if (template.requirement.includes("legendary")) {
        isUnlocked = workouts.some(w => w.difficulty === "legendary");
      }
    }
    
    return { ...template, is_unlocked: isUnlocked };
  });

  const filteredAchievements = filter === "all" 
    ? achievements 
    : filter === "unlocked"
    ? achievements.filter(a => a.is_unlocked)
    : achievements.filter(a => !a.is_unlocked);

  const unlockedCount = achievements.filter(a => a.is_unlocked).length;

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Achievements
            </h1>
          </div>
          <p className="text-slate-600 mb-4">
            Unlock badges by completing workouts and maintaining streaks
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="text-base">
              {unlockedCount} / {achievements.length} Unlocked
            </Badge>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "unlocked", "locked"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === tab
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => {
            const Icon = iconMap[achievement.icon] || Trophy;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: achievement.is_unlocked ? 1.02 : 1 }}
              >
                <Card className={`border-none shadow-lg overflow-hidden h-full ${
                  achievement.is_unlocked ? '' : 'opacity-60'
                }`}>
                  <div className={`h-32 bg-gradient-to-br ${achievement.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {achievement.is_unlocked ? (
                        <Icon className="w-16 h-16 text-white drop-shadow-lg" />
                      ) : (
                        <Lock className="w-16 h-16 text-white/50" />
                      )}
                    </div>
                    {achievement.is_unlocked && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className={`text-xl font-bold mb-2 ${
                      achievement.is_unlocked ? 'text-slate-900' : 'text-slate-500'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      achievement.is_unlocked ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={achievement.is_unlocked ? "default" : "secondary"}
                        className={achievement.is_unlocked ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                      >
                        {achievement.requirement}
                      </Badge>
                      {achievement.is_unlocked && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Unlocked ✓
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No achievements in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}