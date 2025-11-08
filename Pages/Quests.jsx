import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Zap, Play, Filter, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function Quests() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.filter({ is_active: true }, '-created_date'),
    initialData: [],
  });

  const filteredChallenges = challenges.filter(challenge => {
    const difficultyMatch = selectedDifficulty === "all" || challenge.difficulty === selectedDifficulty;
    const typeMatch = selectedType === "all" || challenge.type === selectedType;
    return difficultyMatch && typeMatch;
  });

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Available Quests
            </h1>
          </div>
          <p className="text-slate-600">
            Choose your challenge and earn XP to level up
          </p>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-slate-500" />
              <span className="font-semibold text-slate-700">Filter Quests</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Difficulty</label>
                <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    <TabsTrigger value="beginner" className="flex-1">Beginner</TabsTrigger>
                    <TabsTrigger value="intermediate" className="flex-1">Intermediate</TabsTrigger>
                    <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Type</label>
                <Tabs value={selectedType} onValueChange={setSelectedType}>
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    <TabsTrigger value="strength" className="flex-1">💪 Strength</TabsTrigger>
                    <TabsTrigger value="cardio" className="flex-1">🏃 Cardio</TabsTrigger>
                    <TabsTrigger value="mixed" className="flex-1">🎯 Mixed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quest Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredChallenges.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-slate-500 mb-2">No quests found</p>
              <p className="text-sm text-slate-400">Try adjusting your filters</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-none shadow-lg overflow-hidden h-full group hover:shadow-xl transition-all duration-300">
                    <div className={`h-32 bg-gradient-to-br ${difficultyColors[challenge.difficulty]} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-4 left-4">
                        <span className="text-5xl">{typeIcons[challenge.type]}</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {challenge.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {challenge.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
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

                      {challenge.exercises && challenge.exercises.length > 0 && (
                        <div className="mb-4 text-xs text-slate-500">
                          {challenge.exercises.length} exercises
                        </div>
                      )}
                      
                      <Link to={`${createPageUrl("StartWorkout")}?challengeId=${challenge.id}`} className="block">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2">
                          <Play className="w-4 h-4" />
                          Start Quest
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}