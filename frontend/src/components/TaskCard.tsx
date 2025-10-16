'use client';

import { useDraggable } from '@dnd-kit/core';
import { Task } from '@/types';
import { useTasksStore } from '@/store/tasksStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export default function TaskCard({ task }: TaskCardProps) {
  const { setSelectedTask } = useTasksStore();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleClick = () => {
    setSelectedTask(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>

        {task.dueDate && (
          <span className="text-xs text-gray-500">
            {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        )}
      </div>

      {task.assignedTo.length > 0 && (
        <div className="flex items-center mt-3 space-x-1">
          {task.assignedTo.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center"
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {task.assignedTo.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center">
              +{task.assignedTo.length - 3}
            </div>
          )}
        </div>
      )}

      {task.attachments.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {task.attachments.length} anexo{task.attachments.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

