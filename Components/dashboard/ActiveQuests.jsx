import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Sword, Clock, Zap, Play } from "lucide-react";
import { motion } from "framer-motion";

const difficultyColors = {
  beginner: "from-green-400 to-emerald-500",
  intermediate: "from-yellow-400 to-orange-500",
  advanced: "from-orange-500 to-red-500",
  legendary: "from-purple-500 to-pink-500"
};

const typeIcons = {
  strength: "💪",
  cardio: "🏃",
  flexibility: "🧘",
  endurance: "⚡",
  mixed: "🎯"
};

export default function ActiveQuests({ challenges }) {
  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <Sword className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 mb-2">No active quests</p>
        <p className="text-sm text-slate-400">Check back soon for new challenges!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {challenges.map((challenge, index) => (
        <motion.div
          key={challenge.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${difficultyColors[challenge.difficulty]} opacity-5 group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{typeIcons[challenge.type]}</span>
                    <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${difficultyColors[challenge.difficulty]} text-white font-medium`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {challenge.name}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {challenge.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{challenge.duration_minutes}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-purple-600">
                      +{challenge.xp_reward} XP
                    </span>
                  </div>
                </div>
                
                <Link to={`${createPageUrl("StartWorkout")}?challengeId=${challenge.id}`}>
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2">
                    <Play className="w-4 h-4" />
                    Start
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}