import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, title, value, gradient, subtitle }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
              <Icon className={`w-6 h-6 text-white`} style={{
                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))'
              }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}