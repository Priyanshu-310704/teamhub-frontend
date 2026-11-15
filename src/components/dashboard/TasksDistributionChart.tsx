import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TasksDistributionChartProps {
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
  doneCount: number;
}

const COLORS = ['#94a3b8', '#6366f1', '#a855f7', '#10b981'];

export const TasksDistributionChart: React.FC<TasksDistributionChartProps> = ({
  todoCount,
  inProgressCount,
  inReviewCount,
  doneCount,
}) => {
  const data = [
    { name: 'To Do', value: todoCount },
    { name: 'In Progress', value: inProgressCount },
    { name: 'In Review', value: inReviewCount },
    { name: 'Done', value: doneCount },
  ];

  const total = todoCount + inProgressCount + inReviewCount + doneCount;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Tasks by Status</CardTitle>
        <CardDescription>Current workflow breakdown across projects</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
        {total === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No tasks recorded yet
          </div>
        ) : (
          <div className="w-full">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-md">
                            <span className="font-semibold text-foreground">{item.name}: </span>
                            <span className="text-muted-foreground">{item.value} tasks</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-muted-foreground">{item.name}:</span>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
