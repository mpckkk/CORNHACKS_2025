import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function MacroChart({ protein, carbs, fats }) {
  const data = [
    { name: "Protein", value: protein * 4, color: "#3b82f6" },
    { name: "Carbs", value: carbs * 4, color: "#a855f7" },
    { name: "Fats", value: fats * 9, color: "#f59e0b" }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 text-sm">No macro data yet</p>
        <p className="text-xs text-slate-400 mt-1">Log meals to see breakdown</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${Math.round(value)} cal`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="space-y-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600">{item.name}</span>
            </div>
            <span className="font-semibold text-slate-900">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}