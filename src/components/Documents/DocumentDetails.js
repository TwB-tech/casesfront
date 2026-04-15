import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Input, Space } from 'antd';
import axiosInstance from '../../axiosConfig';
import { useNavigate, useParams } from 'react-router-dom';

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

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        // First get all documents then find the one with matching id
        const response = await axiosInstance.get('/document_management/api/documents/');
        const documents = response.data.results || response.data || [];
        const found = documents.find(doc => String(doc.$id || doc.id) === String(id));
        setDocument(found || null);
        if (found) {
          setFormData({
            title: found.title,
            description: found.description,
          });
        }
      } catch (error) {
        console.error('Error fetching document:', error);
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
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  if (!document) return <div>Loading...</div>;

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
          <Input
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title"
          />
          <TextArea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Description"
            style={{ marginTop: 12, marginBottom: 12 }}
          />
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <Descriptions bordered>
          <Descriptions.Item label="Title">{document.title}</Descriptions.Item>
          <Descriptions.Item label="Description">{document.description}</Descriptions.Item>
          <Descriptions.Item label="Owner">{document.owner.username}</Descriptions.Item>
          <Descriptions.Item label="Shared With">{document.shared_with.map(user => user.username).join(', ')}</Descriptions.Item>
          <Descriptions.Item label="File">
            <a href={document.file} target="_blank" rel="noopener noreferrer">
              View File
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Uploaded At">{document.uploaded_at}</Descriptions.Item>
          <Descriptions.Item label="Created At">{document.created_at}</Descriptions.Item>
          <Descriptions.Item label="Updated At">{document.updated_at}</Descriptions.Item>
        </Descriptions>
      )}
    </div>
  );
}

export default DocumentDetails;
