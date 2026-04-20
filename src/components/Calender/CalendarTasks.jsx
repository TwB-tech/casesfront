import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Card, message } from 'antd';
import axiosInstance from '../../axiosConfig';
import TaskPreview from '../../components/TaskManagement/taskPreview';
import { useNavigate } from 'react-router-dom';
import eventBus from '../../utils/eventBus';

const localizer = momentLocalizer(moment);

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [taskMap, setTaskMap] = useState({});
  const [previewTask, setPreviewTask] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [screenWidth, setScreenWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('tasks/');
        const tasksData = response.data.results;

        const getEventStyle = (priority) => {
          switch (priority) {
            case 'high':
              return { backgroundColor: '#ff8189', color: 'black' };
            case 'medium':
              return { backgroundColor: '#ff7834', color: 'black' };
            case 'low':
              return { backgroundColor: '#738df9', color: 'black' };
            default:
              return { backgroundColor: 'gray', color: 'white' };
          }
        };

        const tasksMap = {};
        const formattedEvents = tasksData.map((task) => {
          tasksMap[task.id] = task;
          return {
            id: task.id,
            title: task.title,
            start: new Date(task.deadline),
            end: new Date(new Date(task.deadline).getTime() + 3600000),
            desc: task.description,
            priority: task.priority,
            style: getEventStyle(task.priority),
          };
        });

        setTasks(formattedEvents);
        setTaskMap(tasksMap);
      } catch (error) {
        console.error(
          'Error fetching tasks:',
          error.response ? error.response.data : error.message
        );
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

  const handleEventClick = (event) => {
    const fullTask = taskMap[event.id];
    setPreviewTask(fullTask);
    setIsPreviewVisible(true);
  };

  const closeTaskPreview = () => {
    setIsPreviewVisible(false);
    setPreviewTask(null);
  };

  const handleNewTaskClick = () => {
    navigate('/tasks/create/');
  };

  // Determine responsive height based on screen width
  const isSmallScreen = screenWidth < 768;
  const calendarHeight = isSmallScreen ? 300 : 500;

  return (
    <div style={{ padding: '15px', maxWidth: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: isSmallScreen ? 'column' : 'row',
          marginBottom: '20px',
        }}
      >
        <Button
          type="primary"
          onClick={handleNewTaskClick}
          style={{
            marginBottom: isSmallScreen ? '10px' : '20px',
            width: isSmallScreen ? '100%' : 'auto',
          }}
        >
          Add Task
        </Button>
      </div>
      <Card
        style={{
          borderRadius: '20px',
          margin: '20px',
          padding: isSmallScreen ? '10px' : '20px',
        }}
      >
        <Calendar
          localizer={localizer}
          events={tasks}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: calendarHeight,
            borderRadius: '20px',
            overflowX: 'auto',
          }}
          onSelectEvent={handleEventClick}
          eventPropGetter={(event) => ({
            style: event.style,
          })}
        />
      </Card>
      <TaskPreview
        task={previewTask}
        visible={isPreviewVisible}
        onClose={closeTaskPreview}
        onEdit={(taskId) => navigate(`/tasks/edit/${taskId}/`)}
        onDelete={async (taskId) => {
          try {
            const confirmed = window.confirm('Are you sure you want to delete this task?');
            if (!confirmed) {
              return;
            }
            await axiosInstance.delete(`/tasks/${taskId}/`);

            const updatedTasks = tasks.filter((task) => task.id !== taskId);
            setTasks(updatedTasks);
            setPreviewTask(null);
            setIsPreviewVisible(false);

            message.success('Task deleted successfully');
            eventBus.emit('taskDeleted', { id: taskId });
          } catch (error) {
            console.error('Error deleting task:', error);
            message.error('Failed to delete task');
          }
        }}
      />
    </div>
  );
}

export default Tasks;
