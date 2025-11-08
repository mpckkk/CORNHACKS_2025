import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Circle, 
  Trophy,
  Timer,
  Zap,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StartWorkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const challengeId = urlParams.get('challengeId');

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const challenges = await base44.entities.Challenge.filter({ id: challengeId });
      return challenges[0];
    },
    enabled: !!challengeId,
  });

  const completeWorkoutMutation = useMutation({
    mutationFn: async (workoutData) => {
      const user = await base44.auth.me();
      const newTotalXP = (user.total_xp || 0) + workoutData.xp_earned;
      const newLevel = Math.floor(newTotalXP / 100) + 1;
      const newTotalWorkouts = (user.total_workouts || 0) + 1;
      const newTotalMinutes = (user.total_minutes || 0) + workoutData.duration_minutes;
      
      const today = new Date().toISOString().split('T')[0];
      const lastWorkout = user.last_workout_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let newStreak = user.current_streak || 0;
      if (!lastWorkout || lastWorkout === yesterday) {
        newStreak += 1;
      } else if (lastWorkout !== today) {
        newStreak = 1;
      }
      
      await base44.auth.updateMe({
        level: newLevel,
        total_xp: newTotalXP,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, user.longest_streak || 0),
        last_workout_date: today,
        total_workouts: newTotalWorkouts,
        total_minutes: newTotalMinutes
      });
      
      return await base44.entities.Workout.create(workoutData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      navigate(createPageUrl("Dashboard"));
    },
  });

  useEffect(() => {
    let interval;
    if (isActive && !isResting) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isResting]);

  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  if (isLoading || !challenge) {
    return <div className="p-8">Loading workout...</div>;
  }

  const exercises = challenge.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

  const handleCompleteExercise = () => {
    const newCompleted = [...completedExercises, currentExerciseIndex];
    setCompletedExercises(newCompleted);
    
    if (currentExerciseIndex < exercises.length - 1) {
      if (currentExercise.rest_seconds) {
        setIsResting(true);
        setRestTimer(currentExercise.rest_seconds);
      }
      setTimeout(() => {
        setCurrentExerciseIndex(prev => prev + 1);
      }, currentExercise.rest_seconds ? currentExercise.rest_seconds * 1000 : 0);
    }
  };

  const handleFinishWorkout = () => {
    completeWorkoutMutation.mutate({
      quest_name: challenge.name,
      quest_type: challenge.type,
      difficulty: challenge.difficulty,
      duration_minutes: Math.ceil(timeElapsed / 60),
      xp_earned: challenge.xp_reward,
      exercises_completed: exercises.map((ex, idx) => ({
        ...ex,
        completed: completedExercises.includes(idx) || idx === currentExerciseIndex
      })),
      completed_at: new Date().toISOString()
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Quests"))}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quests
          </Button>
          <div className="flex items-center gap-2 text-slate-600">
            <Timer className="w-5 h-5" />
            <span className="text-2xl font-bold">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Progress */}
        <Card className="border-none shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-900">{challenge.name}</h2>
              <span className="text-sm text-slate-600">
                {currentExerciseIndex + 1} / {exercises.length}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Rest Timer */}
        <AnimatePresence>
          {isResting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6"
            >
              <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Rest Time</h3>
                  <div className="text-6xl font-bold mb-2">{restTimer}</div>
                  <p className="text-lg opacity-90">seconds remaining</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Exercise */}
        {!isResting && currentExercise && (
          <motion.div
            key={currentExerciseIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className="border-none shadow-2xl mb-6">
              <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-6">
                  {currentExercise.name}
                </h2>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 mb-1">Sets</p>
                    <p className="text-3xl font-bold text-slate-900">{currentExercise.sets}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 mb-1">Reps</p>
                    <p className="text-3xl font-bold text-slate-900">{currentExercise.reps}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 mb-1">Rest</p>
                    <p className="text-3xl font-bold text-slate-900">{currentExercise.rest_seconds}s</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {currentExerciseIndex === exercises.length - 1 ? (
                    <Button
                      onClick={handleFinishWorkout}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-14 text-lg gap-2"
                      disabled={completeWorkoutMutation.isPending}
                    >
                      <Trophy className="w-5 h-5" />
                      {completeWorkoutMutation.isPending ? "Saving..." : "Complete Quest!"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => setIsActive(!isActive)}
                        variant="outline"
                        className="h-14 px-8"
                      >
                        {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      <Button
                        onClick={handleCompleteExercise}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14 text-lg gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Complete Exercise
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Exercise List */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Quest Exercises
            </h3>
            <div className="space-y-2">
              {exercises.map((exercise, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    index === currentExerciseIndex
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : completedExercises.includes(index)
                      ? 'bg-green-50'
                      : 'bg-slate-50'
                  }`}
                >
                  {completedExercises.includes(index) ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : index === currentExerciseIndex ? (
                    <Circle className="w-5 h-5 text-purple-600 fill-purple-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{exercise.name}</p>
                    <p className="text-sm text-slate-600">
                      {exercise.sets} sets × {exercise.reps} reps
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}