'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts';
import { performanceData } from '@/lib/mock-data/courses';

export function PerformanceChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={performanceData} barCategoryGap={28}>
          <XAxis
            dataKey="course"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={64}>
            {performanceData.map((entry) => (
              <Cell key={entry.course} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
