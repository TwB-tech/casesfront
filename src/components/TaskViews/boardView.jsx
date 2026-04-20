import React, { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './boardView.css';

const SortableTaskCard = ({ task, onTaskClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
      onClick={() => onTaskClick(task)}
    >
      <div className="task-card-content">
        <p className="task-title">{task.title}</p>
        <small className="task-due-date">{new Date(task.deadline).toLocaleDateString()}</small>
      </div>
    </div>
  );
};

const BoardView = ({ tasks, onTaskClick, onDragEnd }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByStatus = useMemo(() => {
    if (Array.isArray(tasks)) {
      return {
        'To Do': tasks.filter((task) => !task.status),
        Completed: tasks.filter((task) => task.status),
      };
    }
    return {};
  }, [tasks]);

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    if (!activeTask) return;

    // If dropping on a different status column
    if (overContainer !== activeTask.status) {
      onDragEnd({
        draggableId: active.id,
        destination: { droppableId: overContainer },
        source: { droppableId: activeTask.status || 'To Do' },
      });
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div>
        <div className="board-view">
          {Object.keys(tasksByStatus).map((status) => (
            <div key={status} className="board-column">
              <div className="board-column-header">
                <h3>{status}</h3>
                <button
                  className="add-task-button"
                  onClick={() => {
                    /* handle task creation */
                  }}
                >
                  +
                </button>
              </div>
              <div className="task-list">
                <SortableContext
                  items={tasksByStatus[status]?.map((task) => task.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {tasksByStatus[status]?.map((task) => (
                    <SortableTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
                  ))}
                </SortableContext>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default BoardView;
