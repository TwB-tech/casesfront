import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Select, DatePicker, Row, Col, Tooltip } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';

const { Option } = Select;

function CaseForm() {
  const [users, setUsers] = useState([]);
  const [courts, setCourts] = useState([]);
  const [caseNumber, setCaseNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const isEditing = state?.isEditing;
  const editCase = state?.case;

  useEffect(() => {
    // Fetching data for selects
    const fetchData = async () => {
      const [userRes, courtRes] = await Promise.all([
        axiosInstance.get('/advocate/'),
        axiosInstance.get('/court/'),
      ]);
      setUsers(userRes.data.results);
      setCourts(courtRes.data.results);
    };
    fetchData();

    if (isEditing && editCase) {
      // Prefill the form if editing
      form.setFieldsValue({
        case_number: editCase.case_number,
        title: editCase.title,
        description: editCase.description,
        individual: editCase.client?.username,
        court: editCase.court?.name,
        status: editCase.status,
        start_date: moment(editCase.start_date),
        end_date: editCase.end_date ? moment(editCase.end_date) : null,
      });
    } else {
      generateCaseNumber();
    }
  }, [form, isEditing, editCase]);

  const generateCaseNumber = () => {
    const randomCaseNumber = Math.floor(Math.random() * 2147483648);
    setCaseNumber(randomCaseNumber);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      values.start_date = values.start_date.format('YYYY-MM-DD');
      values.end_date = values.end_date ? values.end_date.format('YYYY-MM-DD') : null;

      let response;
      if (isEditing) {
        // Update the case if editing
        response = await axiosInstance.put(`/case/${editCase.id}/`, values);
      } else {
        // Create a new case
        values.case_number = caseNumber;
        response = await axiosInstance.post('/case/', values);
      }

      form.resetFields();
      setLoading(false);
      navigate('/case-list');
    } catch (error) {
      console.error('Failed:', error);
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.error('Failed:', errorInfo);
  };

  const handleBackClick = () => {
    navigate('/case-list');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <Card style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '20px' }}>
        <Tooltip title="Back to cases">
          <ArrowLeftOutlined onClick={handleBackClick} style={{ marginBottom: '20px', fontSize: "18px", color: "blue", border: "1px solid grey", borderRadius: "50%", padding: "10px" }} />
        </Tooltip>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>{isEditing ? 'Edit Case' : 'Add New Case'}</h1>
        <Form
          form={form}
          name="caseForm"
          layout="vertical"
          initialValues={{ status: 'open' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Case Number"
                name="case_number"
              >
                <Input value={caseNumber} readOnly placeholder={caseNumber} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Please input the case title!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please input the case description!' }]}
              >
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
            <Form.Item
                label="Advocate"
                name="individual"
                rules={[{ required: true, message: 'Please select the advocate!' }]}
              >
                <Select
                  showSearch
                  placeholder="Search and select an advocate"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {users.map(user => <Option key={user.id} value={user.id}>{user.username}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
            <Form.Item
                label="Court"
                name="court"
                rules={[{ required: true, message: 'Please select the court!' }]}
              >
                <Select
                  showSearch
                  placeholder="Search and select a court"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {courts.map(court => <Option key={court.id} value={court.id}>{court.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select the case status!' }]}
              >
                <Select>
                  <Option value="open">Open</Option>
                  <Option value="closed">Closed</Option>
                  <Option value="pending">Pending</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Start Date"
                name="start_date"
                rules={[{ required: true, message: 'Please select the start date!' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Deadline"
                name="end_date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
              {isEditing ? 'Update Case' : 'Submit'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CaseForm;
