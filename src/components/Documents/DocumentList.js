import React, { useEffect, useState , } from 'react';
import { Table, Button, Tooltip, Dropdown, Menu, Card  } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';


function DocumentList() {
    const navigate = useNavigate()

    const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axiosInstance.get('/document_management/api/documents/');
        const data = response.data.results;
        setDocuments(data)
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);


  const handleUploadClick = () => {
    navigate('/new-document')
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axiosInstance.post('/api/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // Optionally, you can refresh the documents list here
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };


  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
    },
    {
        title: 'Shared With',
        dataIndex: 'shared_with',
        key: 'shared_with',
        render: sharedWith => sharedWith.map(user => user.username).join(', '),
      },
    {
      title: 'File',
      dataIndex: 'file',
      key: 'file',
    },
    {
      title: 'Uploaded At',
      dataIndex: 'uploaded_at',
      key: 'uploaded_at',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Dropdown
            overlay={
              <Menu  style={{border:"1px solid #e8e8e8", borderRadius:"10px"}}>
                <Menu.Item key="view">
                  <Link to={`/documents-details/${record.id}`}>
                    <Button type="link" icon={<EyeOutlined />}>
                      View
                    </Button>
                  </Link>
                </Menu.Item>
                <Menu.Item key="edit">
                  <Link to={`/documents-details/${record.id}`}>
                    <Button type="link" icon={<EditOutlined />}>
                      Edit
                    </Button>
                  </Link>
                </Menu.Item>
                <Menu.Item key="download">
                  <Button
                    type="link"
                    href={record.file}
                    download
                    target="_blank"
                    icon={<DownloadOutlined />}
                  >
                    Download
                  </Button>
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
           
          >
            <Button type="link">Actions</Button>
          </Dropdown>
        ),
      },
    ];
    

  return (
    <Card style={{ marginBottom: '20px', borderRadius:"12px", marginTop:"40px"  }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Documents</h1>
            <Tooltip title="Upload New Document">
            <Button type="primary" icon={<UploadOutlined />} style={{ marginBottom: '20px' }} onClick={handleUploadClick}>
                Upload New Document
            </Button>
            </Tooltip>
        </div>
      <Table dataSource={documents} columns={columns} rowKey="id" 
      style={{overflowX:"auto"}}
      />
    </Card>
  );
}

export default DocumentList;
