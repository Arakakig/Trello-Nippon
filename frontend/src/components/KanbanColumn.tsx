'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Task } from '@/types';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

export default function KanbanColumn({ id, title, color, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full">
      <div className={`${color} rounded-t-lg p-3 border-b-2 border-gray-300`}>
        <h3 className="font-semibold text-gray-800 flex items-center justify-between">
          {title}
          <span className="text-xs bg-white px-2 py-1 rounded-full">{tasks.length}</span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 bg-gray-50 rounded-b-lg p-3 min-h-[500px] space-y-3 overflow-y-auto scrollbar-hide"
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            Arraste tarefas aqui
          </div>
        )}
      </div>
    </div>
  );
}

