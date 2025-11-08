import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Flame, 
  Zap, 
  Trophy, 
  Clock, 
  TrendingUp,
  Sword,
  Target,
  Calendar,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import StatsCard from "../components/dashboard/StatsCard";
import RecentWorkouts from "../components/dashboard/RecentWorkouts";
import ActiveQuests from "../components/dashboard/ActiveQuests";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list('-completed_at', 5),
    initialData: [],
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.filter({ is_active: true }, '-created_date', 3),
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

  const level = user?.level || 1;
  const xp = user?.total_xp || 0;
  const xpForNextLevel = level * 100;
  const xpProgress = ((xp % 100) / xpForNextLevel) * 100;

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-8 md:p-12 text-white shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90">Welcome back, Champion!</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Level {level} {user?.character_class || "Athlete"}
            </h1>
            <p className="text-lg opacity-90 mb-6 max-w-2xl">
              You're crushing it! Keep up the momentum and unlock new achievements.
            </p>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-md">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Progress to Level {level + 1}</span>
                <span className="text-sm">{xp % 100}/{xpForNextLevel} XP</span>
              </div>
              <Progress value={xpProgress} className="h-3 bg-white/30" />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Flame}
            title="Current Streak"
            value={`${user?.current_streak || 0} days`}
            gradient="from-orange-500 to-red-500"
            subtitle="Keep it going!"
          />
          <StatsCard
            icon={Trophy}
            title="Total Workouts"
            value={user?.total_workouts || 0}
            gradient="from-yellow-500 to-orange-500"
            subtitle="Quests completed"
          />
          <StatsCard
            icon={Clock}
            title="Total Time"
            value={`${user?.total_minutes || 0}m`}
            gradient="from-blue-500 to-cyan-500"
            subtitle="Training time"
          />
          <StatsCard
            icon={Zap}
            title="Total XP"
            value={user?.total_xp || 0}
            gradient="from-purple-500 to-pink-500"
            subtitle="Experience earned"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Quests */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sword className="w-5 h-5 text-purple-600" />
                  Available Quests
                </CardTitle>
                <Link to={createPageUrl("Quests")}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <ActiveQuests challenges={challenges} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentWorkouts workouts={workouts} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready for your next quest?</h3>
                <p className="text-slate-600">Challenge yourself with a new workout</p>
              </div>
              <Link to={createPageUrl("Quests")}>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2">
                  <Target className="w-5 h-5" />
                  Start Quest
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}