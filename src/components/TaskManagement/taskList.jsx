import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Typography, Tooltip, message } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import TaskPreview from './taskPreview';
import axiosInstance from '../../axiosConfig';
import eventBus from '../../utils/eventBus';

const { Title } = Typography;

const StyledSpace = styled(Space)`
  margin-bottom: 16px;
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background-color: #f0f5ff;
  }
`;

const ActionButton = styled(Button)`
  margin-right: 8px;
`;

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [previewTask, setPreviewTask] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('tasks/');

        if (Array.isArray(response.data.results)) {
          setTasks(response.data.results);
          setFilteredTasks(response.data.results);
        } else {
          console.error('Results key not found or data format is incorrect');
          message.error('Failed to load tasks');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        message.error('Failed to load tasks');
      }
    };
    fetchData();

    const handleTaskChange = () => {
      fetchData();
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

  const columns = [
    {
      title: 'Task Name',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => <a onClick={() => showTaskPreview(record)}>{text}</a>,
    },
    {
      title: 'Assignee',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      sorter: (a, b) => (a.assigned_to_name || '').localeCompare(b.assigned_to_name || ''),
      render: (_, record) => record.assigned_to_name || 'Unassigned',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Completed', value: true },
        { text: 'Pending', value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const color = status ? 'green' : 'volcano';
        return <Tag color={color}>{status ? 'Completed' : 'Pending'}</Tag>;
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'deadline',
      key: 'deadline',
      sorter: (a, b) => new Date(a.deadline) - new Date(b.deadline),
      render: (deadline) => {
        if (!deadline) {
          return 'No due date';
        }
        const date = new Date(deadline);
        const formattedDate = date.toLocaleDateString('en-GB');
        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        return `${formattedDate} ${formattedTime}`;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      filters: [
        { text: 'High', value: 'high' },
        { text: 'Medium', value: 'medium' },
        { text: 'Low', value: 'low' },
      ],
      onFilter: (value, record) => record.priority === value,
      render: (priority) => {
        const color = priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'blue';
        return <Tag color={color}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Tag>;
      },
    },
  ];

  const onSearch = (value) => {
    setSearchText(value);
    const filtered = tasks.filter((task) => task.title.toLowerCase().includes(value.toLowerCase()));
    setFilteredTasks(filtered);
  };

  const clearSearch = () => {
    setSearchText('');
    setFilteredTasks(tasks);
  };

  const showTaskPreview = (task) => {
    setPreviewTask(task);
    setIsPreviewVisible(true);
  };

  const closeTaskPreview = () => {
    setIsPreviewVisible(false);
    setPreviewTask(null);
  };

  const handleEditTask = (taskId) => {
    navigate('/tasks/create/', {
      state: {
        isEditing: true,
        task: tasks.find((task) => task.id === taskId),
      },
    });
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this task?');
      if (!confirmed) {
        return;
      }
      await axiosInstance.delete(`/tasks/tasks/${taskId}/`); // Adjust endpoint as needed

      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      setFilteredTasks(filteredTasks.filter((task) => task.id !== taskId));

      message.success('Task deleted successfully');
      eventBus.emit('taskDeleted', { id: taskId });
      setIsPreviewVisible(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      message.error('Failed to delete task');
    }
  };

  return (
    <div style={{ padding: '24px', marginTop: '10px' }}>
      <Title level={2}>Task List</Title>
      <StyledSpace wrap>
        <Input
          placeholder="Search tasks"
          value={searchText}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 200 }}
          prefix={<SearchOutlined />}
        />
        <Tooltip title="Clear search">
          <ActionButton onClick={clearSearch} disabled={!searchText} icon={<FilterOutlined />}>
            Clear
          </ActionButton>
        </Tooltip>
        {/* <Tooltip title="Perform action on selected tasks">
          <ActionButton type="primary" disabled={selectedRowKeys.length === 0}>
            Bulk Action
          </ActionButton>
        </Tooltip> */}
        <Tooltip title="Add a new task">
          <ActionButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/tasks/create/')}
          >
            Add Task
          </ActionButton>
        </Tooltip>
      </StyledSpace>
      <StyledTable
        // rowSelection={rowSelection}
        columns={columns}
        dataSource={Array.isArray(filteredTasks) ? filteredTasks : []}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => showTaskPreview(record),
          style: { cursor: 'pointer' },
        })}
        style={{ overflowX: 'auto', cursor: 'pointer' }}
        scroll={{ x: 'max-content' }}
      />
      <TaskPreview
        task={previewTask}
        visible={isPreviewVisible}
        onClose={closeTaskPreview}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default TaskList;
