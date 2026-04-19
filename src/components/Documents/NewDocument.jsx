import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Upload, Select, Card, Tooltip, notification } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;
const { Option } = Select;

function NewDocument() {
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const filterOption = useCallback(
    (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
    []
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(`/individual/`);
        setUsers(response.data.results);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    if (file) {
      formData.append('file', file);
    }
    formData.append('owner', values.owner);
    (values.shared_with || []).forEach((user) => formData.append('shared_with', user));

    try {
      await axiosInstance.post('/document_management/api/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/documents');
    } catch (error) {
      console.error('Error uploading document:', error);
      notification.error({
        message: 'Upload Failed',
        description: 'Could not upload document. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (info) => {
    setFile(info.file.originFileObj);
  };

  const handleBackClick = () => {
    navigate('/documents');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <Card style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Add New Document</h1>
          <Tooltip title="Back to documents">
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
        </div>
        <Form name="newDocument" layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input the document title!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the document description!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Owner"
            name="owner"
            rules={[{ required: true, message: 'Please select the owner!' }]}
          >
            <Select
              showSearch
              placeholder="Search and select a User"
              optionFilterProp="children"
              filterOption={filterOption}
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Shared With" name="shared_with">
            <Select
              mode="multiple"
              showSearch
              placeholder="Search and select a User"
              optionFilterProp="children"
              filterOption={filterOption}
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="File"
            name="file"
            rules={[{ required: true, message: 'Please upload a file!' }]}
          >
            <Upload beforeUpload={() => false} onChange={onFileChange}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default NewDocument;
