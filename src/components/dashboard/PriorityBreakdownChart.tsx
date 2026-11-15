import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PriorityBreakdownProps {
  lowCount: number;
  mediumCount: number;
  highCount: number;
  urgentCount: number;
}

export const PriorityBreakdownChart: React.FC<PriorityBreakdownProps> = ({
  lowCount,
  mediumCount,
  highCount,
  urgentCount,
}) => {
  const data = [
    { priority: 'Low', count: lowCount, fill: '#64748b' },
    { priority: 'Medium', count: mediumCount, fill: '#f59e0b' },
    { priority: 'High', count: highCount, fill: '#f43f5e' },
    { priority: 'Urgent', count: urgentCount, fill: '#e11d48' },
  ];

  const total = lowCount + mediumCount + highCount + urgentCount;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Priority Distribution</CardTitle>
        <CardDescription>Task criticality across all active projects</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center p-4">
        {total === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No priority data available
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="priority" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-md">
                          <span className="font-semibold text-foreground">{item.priority}: </span>
                          <span className="text-muted-foreground">{item.count} tasks</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
