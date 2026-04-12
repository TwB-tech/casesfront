import React from 'react';
import { Modal, Typography, Descriptions, Tag, Space, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const TaskPreview = ({ task, visible, onClose, onDelete }) => {
  const navigate = useNavigate();

  if (!task) return null;

  const formattedDueDate = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No due date';

  const handleEdit = () => {
    navigate('/tasks/create/', {
      state: {
        isEditing: true,
        task: task,
      }
    });
  };

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      title={<Title level={4}>{task.title}</Title>}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Assignee">{task.assigned_to_name || task.assigned_to}</Descriptions.Item>
        <Descriptions.Item label="Case">{task.case_title || task.case}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={task.status ? 'green' : 'volcano'}>
            {task.status ? 'Completed' : 'Pending'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Due Date">{formattedDueDate}</Descriptions.Item>
        <Descriptions.Item label="Priority">
          <Tag color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'blue'}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {task.description || 'No description provided'}
        </Descriptions.Item>
      </Descriptions>
      
      <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button icon={<EditOutlined />} onClick={handleEdit}>
          Edit
        </Button>
        <Button icon={<DeleteOutlined />} danger onClick={() => onDelete(task.id)}>
          Delete
        </Button>
      </Space>
    </Modal>
  );
};

export default TaskPreview;
