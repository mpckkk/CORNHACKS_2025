import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplet, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const QUICK_AMOUNTS = [250, 500, 750, 1000];

export default function WaterTracker({ waterLogs, totalWater, waterGoal, selectedDate }) {
  const queryClient = useQueryClient();
  const [customAmount, setCustomAmount] = useState("");

  const addWaterMutation = useMutation({
    mutationFn: (amount) => base44.entities.WaterLog.create({
      amount_ml: amount,
      log_date: selectedDate,
      log_time: new Date().toTimeString().slice(0, 5)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water'] });
      setCustomAmount("");
    },
  });

  const deleteWaterMutation = useMutation({
    mutationFn: (logId) => base44.entities.WaterLog.delete(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water'] });
    },
  });

  const waterProgress = (totalWater / waterGoal) * 100;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-blue-600" />
            Water Intake
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-slate-900">
                {totalWater} ml
              </span>
              <span className="text-sm text-slate-600">
                Goal: {waterGoal} ml
              </span>
            </div>
            <Progress value={waterProgress} className="h-4" />
            <p className="text-xs text-slate-500 mt-1">
              {waterProgress >= 100 ? "🎉 Goal reached!" : `${Math.round(waterProgress)}% of daily goal`}
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Quick Add</h3>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => addWaterMutation.mutate(amount)}
                  disabled={addWaterMutation.isPending}
                  className="h-16 flex flex-col gap-1"
                >
                  <Droplet className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">{amount} ml</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Custom Amount</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount in ml"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={() => {
                  if (customAmount && parseFloat(customAmount) > 0) {
                    addWaterMutation.mutate(parseFloat(customAmount));
                  }
                }}
                disabled={!customAmount || addWaterMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Log History */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Today's Log</CardTitle>
        </CardHeader>
        <CardContent>
          {waterLogs.length === 0 ? (
            <div className="text-center py-8">
              <Droplet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No water logged yet today</p>
              <p className="text-sm text-slate-400">Start tracking your hydration!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {waterLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Droplet className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {log.amount_ml} ml
                        </p>
                        <p className="text-xs text-slate-600">
                          {log.log_time}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWaterMutation.mutate(log.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}