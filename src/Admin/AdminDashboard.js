import React, { useState } from 'react';
import { Form, Button, Checkbox, Select, Tabs, Collapse, message } from 'antd';
import axiosInstance from '../axiosConfig';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);

  const handleCaseDetailsSubmit = async (values) => {
    try {
      setLoading(true);
      await axiosInstance.put('/admin/case-management/details', values); // API endpoint for updating case details settings
      message.success('Case details settings updated successfully');
    } catch (error) {
      message.error('Failed to update case details settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseProgressSubmit = async (values) => {
    try {
      setLoading(true);
      await axiosInstance.put('/admin/case-management/progress', values); // API endpoint for updating case progress settings
      message.success('Case progress settings updated successfully');
    } catch (error) {
      message.error('Failed to update case progress settings');
    } finally {
      setLoading(false);
    }
  };

  const handleClientProfileSubmit = async (values) => {
    try {
      setLoading(true);
      await axiosInstance.put('/admin/client-management/profile', values); // API endpoint for updating client profile settings
      message.success('Client profile settings updated successfully');
    } catch (error) {
      message.error('Failed to update client profile settings');
    } finally {
      setLoading(false);
    }
  };

  const handleClientPortalSubmit = async (values) => {
    try {
      setLoading(true);
      await axiosInstance.put('/admin/client-management/portal', values); // API endpoint for updating client portal settings
      message.success('Client portal settings updated successfully');
    } catch (error) {
      message.error('Failed to update client portal settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Admin Dashboard Settings</h2>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Case Management" key="1">
          <Collapse accordion>
            <Panel header="Case Details Customization" key="1">
              <Form onFinish={handleCaseDetailsSubmit}>
                <Form.Item label="Default Case Status" name="caseStatus">
                  <Select placeholder="Select default status">
                    <Option value="open">Open</Option>
                    <Option value="inProgress">In Progress</Option>
                    <Option value="closed">Closed</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="caseAssignment" valuePropName="checked">
                  <Checkbox>Enable Automatic Case Assignment</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
                </Form.Item>
              </Form>
            </Panel>
            <Panel header="Case Progress Tracking" key="2">
              <Form onFinish={handleCaseProgressSubmit}>
                <Form.Item name="progressTracking" valuePropName="checked">
                  <Checkbox>Enable Case Progress Tracking</Checkbox>
                </Form.Item>
                <Form.Item name="milestones" valuePropName="checked">
                  <Checkbox>Enable Milestone Tracking</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
                </Form.Item>
              </Form>
            </Panel>
          </Collapse>
        </TabPane>
        <TabPane tab="Client Management" key="2">
          <Collapse accordion>
            <Panel header="Client Profile Configuration" key="1">
              <Form onFinish={handleClientProfileSubmit}>
                <Form.Item name="clientFields" valuePropName="checked">
                  <Checkbox>Enable Custom Client Fields</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
                </Form.Item>
              </Form>
            </Panel>
            <Panel header="Client Portal Settings" key="2">
              <Form onFinish={handleClientPortalSubmit}>
                <Form.Item name="clientPortalAccess" valuePropName="checked">
                  <Checkbox>Enable Client Portal Access</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
                </Form.Item>
              </Form>
            </Panel>
          </Collapse>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
