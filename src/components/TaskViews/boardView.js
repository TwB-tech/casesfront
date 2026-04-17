import React, { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './boardView.css';

const BoardView = ({ tasks, onTaskClick, onDragEnd }) => {
  const tasksByStatus = useMemo(() => {
    if (Array.isArray(tasks)) {
      return {
        'To Do': tasks.filter((task) => !task.status),
        Completed: tasks.filter((task) => task.status),
      };
    }
    return {};
  }, [tasks]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        <div className="board-view">
          {Object.keys(tasksByStatus).map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div className="board-column" ref={provided.innerRef} {...provided.droppableProps}>
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
                    {tasksByStatus[status]?.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            className="task-card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(task)}
                          >
                            <div className="task-card-content">
                              <p className="task-title">{task.title}</p>
                              <small className="task-due-date">
                                {new Date(task.deadline).toLocaleDateString()}
                              </small>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default BoardView;
