import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Descriptions, Spin } from "antd";
import axiosInstance from "../../axiosConfig";
import {Button} from "antd";

const MailDetails = () => {
  const { id } = useParams();
  const [mail, setMail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/clientcomm/api/clientcommunications/${id}/`)
      .then((response) => {
        setMail(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the mail details!", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <Spin />;
  }

  if (!mail) {
    return <div>No mail details found.</div>;
  }

  return (
    <>
        <div
            style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "20px",
            border: "1px solid #e0e0e0",
            backgroundColor: "#fff",
            fontFamily: "Arial, sans-serif",
            borderRadius: "10px",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Email Details</h2>
                <Button type="primary" onClick={() => window.history.back()}>Back</Button>
            </div>

            <Descriptions bordered>
            <Descriptions.Item label="To">{mail.email}</Descriptions.Item>
            <Descriptions.Item label="Subject">{mail.subject}</Descriptions.Item>
            <Descriptions.Item label="Date">{mail.created_at}</Descriptions.Item>
            <Descriptions.Item label="Message">{mail.message}</Descriptions.Item>
            <Descriptions.Item label="Meeting Link">
                {mail.google_meet_link}
            </Descriptions.Item>
            </Descriptions>   
        </div>
        
    </>
    
  );
};

export default MailDetails;
