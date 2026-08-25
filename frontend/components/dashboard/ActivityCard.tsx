"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", activity: 45 },
  { day: "Tue", activity: 62 },
  { day: "Wed", activity: 38 },
  { day: "Thu", activity: 78 },
  { day: "Fri", activity: 56 },
  { day: "Sat", activity: 90 },
  { day: "Sun", activity: 42 },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827] text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg">
      {label}: {payload[0].value}%
    </div>
  );
}

export default function ActivityCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.45 }}
      className="col-span-12 lg:col-span-5 rounded-[24px] bg-white border border-[#E5E7EB] shadow-sm card-hover"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Activity Overview
          </h3>
          <button className="flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#111827] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#F8F9FB]">
            This Week
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="flex items-end gap-3 mb-6">
          <div>
            <p className="text-sm text-[#64748B] font-medium">Your Activity</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-4xl font-bold text-[#111827]">72</span>
              <span className="text-xl font-bold text-[#64748B]">%</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#10B981] mb-1.5">
            <TrendingUp size={14} />
            <span>12% from last week</span>
          </div>
        </div>

        <div style={{ width: "100%", height: 140, minWidth: 200, minHeight: 100 }}>
          {mounted && (
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={100}>
              <BarChart data={data} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }}
                />
                <YAxis hide />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(232, 110, 10, 0.05)" }}
                />
                <Bar
                  dataKey="activity"
                  fill="#E86E0A"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1200}
                  animationBegin={300}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
}
