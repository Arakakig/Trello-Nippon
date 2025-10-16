'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useTasksStore } from '@/store/tasksStore';
import { useProjectsStore } from '@/store/projectsStore';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import { Task } from '@/types';

const columns = [
  { id: 'todo', title: 'A Fazer', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'Em Progresso', color: 'bg-blue-100' },
  { id: 'review', title: 'Em Revisão', color: 'bg-yellow-100' },
  { id: 'done', title: 'Concluído', color: 'bg-green-100' },
];

export default function KanbanBoard() {
  const { tasks, fetchTasks, reorderTasks } = useTasksStore();
  const { selectedProject } = useProjectsStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject._id);
    }
  }, [selectedProject, fetchTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Atualizar ordem das tarefas
    const tasksInNewColumn = tasks.filter(
      (t) => t.status === newStatus && t._id !== taskId
    );

    const updatedTasks = [
      ...tasks.filter((t) => t.status !== newStatus && t._id !== taskId),
      ...tasksInNewColumn,
      { ...task, status: newStatus },
    ].map((t, index) => ({
      id: t._id,
      status: t._id === taskId ? newStatus : t.status,
      order: index,
    }));

    reorderTasks(updatedTasks);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={tasks.filter((task) => task.status === column.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

