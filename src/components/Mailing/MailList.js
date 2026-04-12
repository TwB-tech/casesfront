import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";

const MailList = () => {
  const [mails, setMails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/clientcomm/api/clientcommunications/")
      .then((response) => {
        setMails(response.data.results);
      })
      .catch((error) => {
        console.error("There was an error fetching the mails!", error);
      });
  }, []);

  const columns = [
    {
      title: "To",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => navigate(`/mail-details/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop:"40px"  }}>
        <h2>Emails</h2>
        <Button type="primary" onClick={() => navigate("/new-mail")}>
          New Email
        </Button>
      </div>
      <Table 
        dataSource={mails} 
        columns={columns} 
        rowKey="id" 
        pagination={false}
        style={{ overflowX: 'auto', cursor: 'pointer' }}
        scroll={{ x: 'max-content' }}
      />
    </>
  );
};

export default MailList;
