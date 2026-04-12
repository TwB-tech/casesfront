import React, { useState, useEffect } from 'react';
import TaskList from './taskList';
import BoardView from '../../components/TaskViews/boardView';
import CalendarView from '../../components/Calender/CalendarTasks';
import ViewSwitcher from '../../components/TaskViews/viewSwitcher';
import TaskForm from './taskForm';
import TaskPreview from './taskPreview';
import axiosInstance from '../../axiosConfig';

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
                console.error('Error fetching tasks:', error.response ? error.response.data : error.message);
            }
        };

        fetchTasks();
    }, []);

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsTaskPreviewVisible(true);
    };

    const handleEditTask = (taskId) => {
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
        <div style={{ marginTop:"40px"  }}>
            <ViewSwitcher currentView={currentView} onViewChange={handleViewChange} />
            {currentView === 'list' && <TaskList tasks={tasks} onTaskClick={handleTaskClick} />}
            {currentView === 'board' && <BoardView tasks={tasks} onTaskClick={handleTaskClick} />}
            {/* {currentView === 'calendar' && <CalendarView tasks={tasks} />} */}
            <TaskPreview
                task={selectedTask}
                visible={isTaskPreviewVisible}
                onClose={handleCloseTaskPreview}
                onEdit={handleEditTask}
                onDelete={() => { /* implement delete function */ }}
            />
            {isTaskFormVisible && <TaskForm onClose={handleCloseTaskForm} taskId={selectedTask?.id} />}
        </div>
    );
};

export default Tasks;