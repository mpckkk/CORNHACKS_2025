import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function NutritionStats({ title, value, goal, unit, color }) {
  const progress = goal > 0 ? (value / goal) * 100 : 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="mb-3">
            <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900">{Math.round(value)}</p>
              <span className="text-sm text-slate-500">/ {goal} {unit}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-400 mt-2">
            {progress >= 100 ? "Goal reached! 🎉" : `${Math.round(progress)}% of goal`}
          </p>
          <div className={`mt-3 h-1 bg-gradient-to-r ${color} rounded-full`} />
        </CardContent>
      </Card>
    </motion.div>
  );
}