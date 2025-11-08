import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Apple } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mealTypeEmojis = {
  breakfast: "🌅",
  lunch: "🌞",
  dinner: "🌙",
  snack: "🍎"
};

const mealTypeColors = {
  breakfast: "from-orange-400 to-yellow-400",
  lunch: "from-green-400 to-emerald-400",
  dinner: "from-blue-400 to-indigo-400",
  snack: "from-pink-400 to-purple-400"
};

export default function MealList({ meals, onDelete }) {
  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <Apple className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 mb-2">No meals logged yet</p>
        <p className="text-sm text-slate-400">Start tracking your nutrition!</p>
      </div>
    );
  }

  const mealsByType = {
    breakfast: meals.filter(m => m.meal_type === 'breakfast'),
    lunch: meals.filter(m => m.meal_type === 'lunch'),
    dinner: meals.filter(m => m.meal_type === 'dinner'),
    snack: meals.filter(m => m.meal_type === 'snack')
  };

  return (
    <div className="space-y-6">
      {Object.entries(mealsByType).map(([type, typeMeals]) => {
        if (typeMeals.length === 0) return null;
        
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{mealTypeEmojis[type]}</span>
              <h3 className="font-semibold text-slate-900 capitalize">{type}</h3>
              <Badge variant="secondary" className="ml-auto">
                {typeMeals.reduce((sum, m) => sum + (m.calories || 0), 0)} kcal
              </Badge>
            </div>
            
            <div className="space-y-2">
              <AnimatePresence>
                {typeMeals.map((meal) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="relative overflow-hidden rounded-xl border border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${mealTypeColors[type]}`} />
                    <div className="p-4 pl-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">
                            {meal.meal_name}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                            {meal.calories > 0 && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                {meal.calories} cal
                              </span>
                            )}
                            {meal.protein > 0 && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                {meal.protein}g protein
                              </span>
                            )}
                            {meal.carbs > 0 && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {meal.carbs}g carbs
                              </span>
                            )}
                            {meal.fats > 0 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                                {meal.fats}g fats
                              </span>
                            )}
                          </div>
                          {meal.notes && (
                            <p className="text-sm text-slate-500 mt-2">{meal.notes}</p>
                          )}
                          {meal.meal_time && (
                            <p className="text-xs text-slate-400 mt-1">
                              {meal.meal_time}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(meal.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}