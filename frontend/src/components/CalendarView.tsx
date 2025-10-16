'use client';

import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTasksStore } from '@/store/tasksStore';
import { useProjectsStore } from '@/store/projectsStore';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Task } from '@/types';

export default function CalendarView() {
  const { tasks, fetchTasks, setSelectedTask } = useTasksStore();
  const { selectedProject } = useProjectsStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksOnDate, setTasksOnDate] = useState<Task[]>([]);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject._id);
    }
  }, [selectedProject, fetchTasks]);

  useEffect(() => {
    const filtered = tasks.filter(
      (task) => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
    );
    setTasksOnDate(filtered);
  }, [selectedDate, tasks]);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const tasksOnThisDay = tasks.filter(
        (task) => task.dueDate && isSameDay(new Date(task.dueDate), date)
      );

      if (tasksOnThisDay.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  const priorityColors = {
    low: 'border-green-500',
    medium: 'border-yellow-500',
    high: 'border-red-500',
  };

  const statusLabels = {
    todo: 'A Fazer',
    in_progress: 'Em Progresso',
    review: 'Em Revisão',
    done: 'Concluído',
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Calendário de Tarefas</h2>
          <Calendar
            onChange={(value) => setSelectedDate(value as Date)}
            value={selectedDate}
            locale="pt-BR"
            tileContent={tileContent}
            className="w-full"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            Tarefas para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>

          {tasksOnDate.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma tarefa agendada para esta data
            </p>
          ) : (
            <div className="space-y-3">
              {tasksOnDate.map((task) => (
                <div
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className={`border-l-4 ${priorityColors[task.priority]} bg-gray-50 p-4 rounded-r-lg cursor-pointer hover:bg-gray-100 transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center mt-2 space-x-3">
                        <span className="text-xs text-gray-500">
                          Status: {statusLabels[task.status]}
                        </span>
                        {task.assignedTo.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {task.assignedTo.slice(0, 2).map((user) => (
                              <div
                                key={user.id}
                                className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center"
                                title={user.name}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

