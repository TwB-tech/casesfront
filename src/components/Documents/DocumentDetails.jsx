import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Input, Space, message } from 'antd';
import axiosInstance from '../../axiosConfig';
import { useNavigate, useParams } from 'react-router-dom';
import eventBus from '../../utils/eventBus';

const { TextArea } = Input;

function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/api/documents/${id}/`);
        setDocument(response.data);
        setFormData({
          title: response.data.title || '',
          description: response.data.description || '',
        });
      } catch (error) {
        console.error('Error fetching document:', error);
        setError('Document not found');
        message.error('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await axiosInstance.put(`/api/documents/${id}/`, formData);
      setDocument(response.data);
      setIsEditing(false);
      message.success('Document updated successfully');
      eventBus.emit('documentUpdated', { id: id });
    } catch (error) {
      console.error('Error saving document:', error);
      message.error('Failed to update document');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading document...</div>;
  }

  if (error || !document) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Document not found'}</p>
        <Button type="primary" onClick={() => navigate('/documents')}>
          Back to Documents
        </Button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/documents')}>Back to Documents</Button>
        {!isEditing && (
          <Button type="primary" onClick={handleEdit}>
            Edit Document
          </Button>
        )}
      </Space>
      <h1>Document Details</h1>
      {isEditing ? (
        <div>
          <div style={{ marginBottom: 12 }}>
            <label className="block mb-2">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="block mb-2">Description</label>
            <TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Description"
            />
          </div>
          <Button type="primary" onClick={handleSave} style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <Descriptions bordered>
          <Descriptions.Item label="Title">{document.title}</Descriptions.Item>
          <Descriptions.Item label="Description">{document.description}</Descriptions.Item>
          <Descriptions.Item label="Owner">
            {document.owner?.username || 'Unknown'}
          </Descriptions.Item>
          <Descriptions.Item label="Shared With">
            {document.shared_with?.map((user) => user.username).join(', ') || 'None'}
          </Descriptions.Item>
          <Descriptions.Item label="File">
            <a href={document.file} target="_blank" rel="noopener noreferrer">
              View File
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Uploaded At">
            {new Date(document.uploaded_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(document.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(document.updated_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      )}
    </div>
  );
}

export default DocumentDetails;
