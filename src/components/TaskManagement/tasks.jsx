import React, { useState, useEffect } from 'react';
import TaskList from './taskList';
import BoardView from '../../components/TaskViews/boardView';
import ViewSwitcher from '../../components/TaskViews/viewSwitcher';
import TaskForm from './taskForm';
import TaskPreview from './taskPreview';
import axiosInstance from '../../axiosConfig';
import eventBus from '../../utils/eventBus';

const Tasks = () => {
  const [currentView, setCurrentView] = useState('list');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskPreviewVisible, setIsTaskPreviewVisible] = useState(false);
  const [isTaskFormVisible, setIsTaskFormVisible] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('tasks/');
        setTasks(response.data.results);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();

    const handleTaskChange = () => {
      fetchTasks();
    };

    const unsub1 = eventBus.on('taskCreated', handleTaskChange);
    const unsub2 = eventBus.on('taskUpdated', handleTaskChange);
    const unsub3 = eventBus.on('taskDeleted', handleTaskChange);

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskPreviewVisible(true);
  };

  const handleEditTask = (_taskId) => {
    setIsTaskFormVisible(true);
  };

  const handleCloseTaskPreview = () => {
    setIsTaskPreviewVisible(false);
    setSelectedTask(null);
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormVisible(false);
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <ViewSwitcher currentView={currentView} onViewChange={handleViewChange} />
      {currentView === 'list' && <TaskList tasks={tasks} onTaskClick={handleTaskClick} />}
      {currentView === 'board' && <BoardView tasks={tasks} onTaskClick={handleTaskClick} />}
      <TaskPreview
        task={selectedTask}
        visible={isTaskPreviewVisible}
        onClose={handleCloseTaskPreview}
        onEdit={handleEditTask}
        onDelete={() => {
          /* implement delete function */
        }}
      />
      {isTaskFormVisible && <TaskForm onClose={handleCloseTaskForm} taskId={selectedTask?.id} />}
    </div>
  );
};

export default Tasks;
