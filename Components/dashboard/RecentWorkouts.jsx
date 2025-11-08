import React from "react";
import { format } from "date-fns";
import { CheckCircle2, Dumbbell } from "lucide-react";

const difficultyColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-orange-100 text-orange-700",
  legendary: "bg-purple-100 text-purple-700"
};

export default function RecentWorkouts({ workouts }) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500">No workouts yet</p>
        <p className="text-sm text-slate-400">Start your first quest!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-slate-900 truncate">
              {workout.quest_name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[workout.difficulty]}`}>
                {workout.difficulty}
              </span>
              <span className="text-xs text-slate-500">
                {workout.duration_minutes}min
              </span>
              <span className="text-xs text-purple-600 font-medium">
                +{workout.xp_earned} XP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {format(new Date(workout.completed_at), "MMM d, h:mm a")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}