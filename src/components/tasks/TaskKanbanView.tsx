import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { Plus, Circle, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus } from '@/types/task.types';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskKanbanViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddTaskInStatus?: (status: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  badgeBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'TODO',
    title: 'To Do',
    icon: Circle,
    iconColor: 'text-slate-400 fill-slate-400',
    badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    icon: Clock,
    iconColor: 'text-indigo-500',
    badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  },
  {
    id: 'IN_REVIEW',
    title: 'In Review',
    icon: AlertCircle,
    iconColor: 'text-purple-500',
    badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  },
  {
    id: 'DONE',
    title: 'Done',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onAddTaskInStatus,
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    onStatusChange(draggableId, newStatus);
  };

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasksByStatus[col.id];
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-xl border border-border/80 bg-muted/30 p-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', col.iconColor)} />
                  <span className="text-sm font-semibold text-foreground">
                    {col.title}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      col.badgeBg
                    )}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {onAddTaskInStatus && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAddTaskInStatus(col.id)}
                    className="h-7 w-7 text-muted-foreground hover:bg-background hover:text-foreground"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex-1 min-h-[300px] space-y-2.5 rounded-lg p-1 transition-colors',
                      snapshot.isDraggingOver &&
                        'bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500/30'
                    )}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              onClick={() => onTaskClick(task)}
                              isDragging={dragSnapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 text-xs text-muted-foreground">
                        <span>No tasks in {col.title}</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
