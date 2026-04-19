import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  Row,
  Col,
  Tooltip,
  notification,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useCurrency } from '../../contexts/CurrencyContext';
import { formatCurrency } from '../../utils/currency';
import axiosInstance from '../../axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';

const { Option } = Select;

function TaskForm() {
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const isEditing = state?.isEditing;
  const editTask = state?.task;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, caseRes] = await Promise.all([
          axiosInstance.get('/individual/'), // Adjust endpoint if needed
          axiosInstance.get('/case/'),
        ]);
        setUsers(userRes.data.results);
        setCases(caseRes.data.results);

        if (isEditing && editTask) {
          form.setFieldsValue({
            title: editTask.title,
            description: editTask.description,
            assigned_to: editTask.assigned_to_id ?? editTask.assigned_to,
            case: editTask.case_id ?? editTask.case,
            priority: editTask.priority,
            deadline: moment(editTask.deadline),
            status: editTask.status,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [isEditing, editTask, form]);

  useEffect(() => {
    if (isEditing && editTask) {
      form.setFieldsValue({
        title: editTask.title,
        description: editTask.description,
        assigned_to: editTask.assigned_to_id ?? editTask.assigned_to,
        case: editTask.case_id ?? editTask.case,
        priority: editTask.priority,
        deadline: moment(editTask.deadline),
        status: editTask.status,
      });
    }
  }, [isEditing, editTask, form, location.state]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      values.deadline = values.deadline.format('YYYY-MM-DD HH:mm:ss');
      if (isEditing) {
        await axiosInstance.put(`tasks/tasks/${editTask.id}/`, values);
        notification.success({
          message: 'Success',
          description: 'Task updated successfully!',
        });
      } else {
        await axiosInstance.post('tasks/create/', values);
        notification.success({
          message: 'Success',
          description: 'Task created successfully!',
        });
      }
      navigate(-1);
    } catch (error) {
      console.error('Failed to save task:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to save task. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (_errorInfo) => {
    notification.error({
      message: 'Form Incomplete',
      description: 'Please fill in the required task fields before saving.',
    });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <Card style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '20px' }}>
        <Tooltip title="Back to tasks">
          <ArrowLeftOutlined
            onClick={handleBackClick}
            style={{
              marginBottom: '20px',
              fontSize: '18px',
              color: 'blue',
              border: '1px solid grey',
              borderRadius: '50%',
              padding: '10px',
            }}
          />
        </Tooltip>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
          {isEditing ? 'Editing Task' : 'Add New Task'}
        </h1>
        <Form
          form={form}
          name="taskForm"
          layout="vertical"
          initialValues={{ status: false, priority: 'low' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Please input the task title!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please input the task description!' }]}
              >
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Assigned To"
                name="assigned_to"
                rules={[{ required: true, message: 'Please select the user!' }]}
              >
                <Select>
                  {users.map((user) => (
                    <Option key={user.id} value={user.id}>
                      {user.username}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Case"
                name="case"
                rules={[{ required: true, message: 'Please select the case!' }]}
              >
                <Select>
                  {cases.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Priority"
                name="priority"
                rules={[{ required: true, message: 'Please select the task priority!' }]}
              >
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Deadline"
                name="deadline"
                rules={[{ required: true, message: 'Please select the deadline!' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Status" name="status">
                <Select>
                  <Option value={true}>Completed</Option>
                  <Option value={false}>Pending</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
              {isEditing ? 'Update' : 'Submit'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default TaskForm;
