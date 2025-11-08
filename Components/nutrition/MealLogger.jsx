import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MealLogger({ selectedDate, onClose }) {
  const queryClient = useQueryClient();
  const [mealData, setMealData] = useState({
    meal_type: "breakfast",
    meal_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    meal_date: selectedDate,
    meal_time: new Date().toTimeString().slice(0, 5),
    notes: ""
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const createMealMutation = useMutation({
    mutationFn: (meal) => base44.entities.Meal.create(meal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['meals-all'] });
      onClose();
    },
  });

  const handleAIAnalysis = async () => {
    if (!mealData.meal_name.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this meal and estimate its nutritional content: "${mealData.meal_name}". Provide realistic estimates for calories, protein (g), carbs (g), and fats (g). Return only the numbers.`,
        response_json_schema: {
          type: "object",
          properties: {
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fats: { type: "number" }
          }
        }
      });
      
      setMealData(prev => ({
        ...prev,
        calories: result.calories || "",
        protein: result.protein || "",
        carbs: result.carbs || "",
        fats: result.fats || ""
      }));
    } catch (error) {
      console.error("Error analyzing meal:", error);
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mealToSubmit = {
      ...mealData,
      calories: parseFloat(mealData.calories) || 0,
      protein: parseFloat(mealData.protein) || 0,
      carbs: parseFloat(mealData.carbs) || 0,
      fats: parseFloat(mealData.fats) || 0
    };
    createMealMutation.mutate(mealToSubmit);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="border-none shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Log a Meal</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meal_type">Meal Type</Label>
                    <Select
                      value={mealData.meal_type}
                      onValueChange={(value) => setMealData({ ...mealData, meal_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                        <SelectItem value="lunch">🌞 Lunch</SelectItem>
                        <SelectItem value="dinner">🌙 Dinner</SelectItem>
                        <SelectItem value="snack">🍎 Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="meal_time">Time</Label>
                    <Input
                      type="time"
                      value={mealData.meal_time}
                      onChange={(e) => setMealData({ ...mealData, meal_time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="meal_name">Meal Description *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="meal_name"
                      placeholder="e.g., Grilled chicken with brown rice and broccoli"
                      value={mealData.meal_name}
                      onChange={(e) => setMealData({ ...mealData, meal_name: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      onClick={handleAIAnalysis}
                      disabled={!mealData.meal_name.trim() || isAnalyzing}
                      className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      AI Analyze
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Click AI Analyze to automatically estimate nutrition values
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="0"
                      value={mealData.calories}
                      onChange={(e) => setMealData({ ...mealData, calories: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      placeholder="0"
                      value={mealData.protein}
                      onChange={(e) => setMealData({ ...mealData, protein: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      placeholder="0"
                      value={mealData.carbs}
                      onChange={(e) => setMealData({ ...mealData, carbs: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fats">Fats (g)</Label>
                    <Input
                      id="fats"
                      type="number"
                      placeholder="0"
                      value={mealData.fats}
                      onChange={(e) => setMealData({ ...mealData, fats: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional details..."
                    value={mealData.notes}
                    onChange={(e) => setMealData({ ...mealData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMealMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {createMealMutation.isPending ? "Saving..." : "Save Meal"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}