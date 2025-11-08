import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Apple, Droplet, TrendingUp, Plus, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import MealLogger from "../components/nutrition/MealLogger";
import WaterTracker from "../components/nutrition/WaterTracker";
import MealList from "../components/nutrition/MealList";
import NutritionStats from "../components/nutrition/NutritionStats";
import MacroChart from "../components/nutrition/MacroChart";

export default function Nutrition() {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showMealLogger, setShowMealLogger] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const queryClient = useQueryClient();

  const { data: meals = [] } = useQuery({
    queryKey: ['meals', selectedDate],
    queryFn: () => base44.entities.Meal.filter({ meal_date: selectedDate }, '-created_date'),
    initialData: [],
  });

  const { data: allMeals = [] } = useQuery({
    queryKey: ['meals-all'],
    queryFn: () => base44.entities.Meal.list('-meal_date', 100),
    initialData: [],
  });

  const { data: waterLogs = [] } = useQuery({
    queryKey: ['water', selectedDate],
    queryFn: () => base44.entities.WaterLog.filter({ log_date: selectedDate }, '-created_date'),
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

  const deleteMealMutation = useMutation({
    mutationFn: (mealId) => base44.entities.Meal.delete(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['meals-all'] });
    },
  });

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
  const totalWater = waterLogs.reduce((sum, log) => sum + (log.amount_ml || 0), 0);

  const calorieGoal = user?.daily_calorie_goal || 2000;
  const waterGoal = user?.daily_water_goal_ml || 2000;

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Apple className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Nutrition Tracking
            </h1>
          </div>
          <p className="text-slate-600">
            Log your meals and water intake for optimal performance
          </p>
        </div>

        {/* Date and Quick Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <Button
            onClick={() => setShowMealLogger(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Meal
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <NutritionStats
            title="Calories"
            value={totalCalories}
            goal={calorieGoal}
            unit="kcal"
            color="from-orange-500 to-red-500"
          />
          <NutritionStats
            title="Protein"
            value={totalProtein}
            goal={Math.round(calorieGoal * 0.3 / 4)}
            unit="g"
            color="from-blue-500 to-cyan-500"
          />
          <NutritionStats
            title="Carbs"
            value={totalCarbs}
            goal={Math.round(calorieGoal * 0.4 / 4)}
            unit="g"
            color="from-purple-500 to-pink-500"
          />
          <NutritionStats
            title="Fats"
            value={totalFats}
            goal={Math.round(calorieGoal * 0.3 / 9)}
            unit="g"
            color="from-yellow-500 to-orange-500"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="today">Today's Log</TabsTrigger>
            <TabsTrigger value="water">Water Intake</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="w-5 h-5 text-green-600" />
                      Meals for {format(new Date(selectedDate), 'MMM d, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MealList
                      meals={meals}
                      onDelete={(mealId) => deleteMealMutation.mutate(mealId)}
                    />
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Macro Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MacroChart
                      protein={totalProtein}
                      carbs={totalCarbs}
                      fats={totalFats}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="water">
            <WaterTracker
              waterLogs={waterLogs}
              totalWater={totalWater}
              waterGoal={waterGoal}
              selectedDate={selectedDate}
            />
          </TabsContent>

          <TabsContent value="insights">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Nutrition Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Weekly Calorie Trend */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                        <p className="text-sm text-slate-600 mb-1">Total Meals Logged</p>
                        <p className="text-2xl font-bold text-slate-900">{allMeals.length}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                        <p className="text-sm text-slate-600 mb-1">Avg Daily Calories</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {allMeals.length > 0 
                            ? Math.round(allMeals.reduce((sum, m) => sum + (m.calories || 0), 0) / 7)
                            : 0}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                        <p className="text-sm text-slate-600 mb-1">Goal Progress</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {Math.round((totalCalories / calorieGoal) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Coach Recommendation */}
                  <div className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white">
                    <h3 className="font-bold text-lg mb-2">💡 Quick Tip</h3>
                    <p className="text-sm opacity-90">
                      Talk to your AI Coach for personalized nutrition advice based on your workout and meal history. 
                      Get custom meal plans and hydration strategies!
                    </p>
                    <Button
                      className="mt-4 bg-white text-purple-600 hover:bg-slate-50"
                      onClick={() => window.location.href = createPageUrl("AICoach")}
                    >
                      Ask AI Coach
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Meal Logger Modal */}
        {showMealLogger && (
          <MealLogger
            selectedDate={selectedDate}
            onClose={() => setShowMealLogger(false)}
          />
        )}
      </div>
    </div>
  );
}