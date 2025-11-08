import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Zap, TrendingUp, Crown, Medal, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sortBy, setSortBy] = useState("total_xp");

  const { data: users = [] } = useQuery({
    queryKey: ['users', sortBy],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list(`-${sortBy}`);
      return allUsers;
    },
    initialData: [],
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-slate-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-slate-500">{index + 1}</span>;
  };

  const getRankBg = (index) => {
    if (index === 0) return "from-yellow-400 to-orange-500";
    if (index === 1) return "from-slate-300 to-slate-400";
    if (index === 2) return "from-orange-400 to-orange-600";
    return "from-slate-200 to-slate-300";
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Leaderboard
            </h1>
          </div>
          <p className="text-slate-600">
            Compete with other warriors and climb the ranks
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setSortBy("total_xp")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              sortBy === "total_xp"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Zap className="w-4 h-4 inline mr-1" />
            Total XP
          </button>
          <button
            onClick={() => setSortBy("level")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              sortBy === "level"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Level
          </button>
          <button
            onClick={() => setSortBy("current_streak")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              sortBy === "current_streak"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            🔥 Streak
          </button>
          <button
            onClick={() => setSortBy("total_workouts")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              sortBy === "total_workouts"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-1" />
            Workouts
          </button>
        </div>

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 0, 2].map((position) => {
              const user = users[position];
              if (!user) return null;
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: position * 0.1 }}
                  className={position === 0 ? "order-1" : position === 1 ? "order-0" : "order-2"}
                >
                  <Card className={`border-none shadow-xl overflow-hidden ${
                    position === 0 ? "transform scale-105" : ""
                  }`}>
                    <div className={`h-24 bg-gradient-to-br ${getRankBg(position)} flex items-center justify-center`}>
                      {getRankIcon(position)}
                    </div>
                    <CardContent className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {user.full_name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 truncate">
                        {user.full_name || "User"}
                      </h3>
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                        Level {user.level || 1}
                      </Badge>
                      <div className="text-sm text-slate-600">
                        <p className="font-semibold text-purple-600">
                          {sortBy === "total_xp" && `${user.total_xp || 0} XP`}
                          {sortBy === "level" && `Level ${user.level || 1}`}
                          {sortBy === "current_streak" && `${user.current_streak || 0} day streak`}
                          {sortBy === "total_workouts" && `${user.total_workouts || 0} workouts`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    user.id === currentUser?.id ? "bg-purple-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                      {index < 3 ? (
                        getRankIcon(index)
                      ) : (
                        <span className="text-lg font-bold text-slate-400">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {user.full_name?.charAt(0) || "U"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {user.full_name || "User"}
                        </h3>
                        {user.id === currentUser?.id && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        Level {user.level || 1} • {user.character_class || "Athlete"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {sortBy === "total_xp" && `${user.total_xp || 0}`}
                        {sortBy === "level" && `${user.level || 1}`}
                        {sortBy === "current_streak" && `${user.current_streak || 0}`}
                        {sortBy === "total_workouts" && `${user.total_workouts || 0}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {sortBy === "total_xp" && "XP"}
                        {sortBy === "level" && "Level"}
                        {sortBy === "current_streak" && "days"}
                        {sortBy === "total_workouts" && "quests"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {users.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No users on the leaderboard yet</p>
          </div>
        )}
      </div>
    </div>
  );
}