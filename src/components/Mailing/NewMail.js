import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import axiosInstance from "../../axiosConfig";

const NewMail = () => {
    const [subject, setSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [email, setEmail] = useState("");
    const [googleMeetLink, setGoogleMeetLink]=useState("")
    const [loading, setLoading] = useState(false);

    const handleSend = () => {
        setLoading(true);
        axiosInstance
            .post("/clientcomm/api/clientcommunications/", {
                email: email,
                subject: subject,
                message: emailMessage,
                google_meet_link: googleMeetLink,
            })
            .then((response) => {
                message.success("Email sent successfully!");
                setSubject("");
                setEmailMessage("");
                setEmail("");
                setGoogleMeetLink("")
            })
            .catch((error) => {
                message.error("There was an error sending the email!");
                console.error("Error:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div
            style={{
                width: "800px",
                margin: "0 auto",
                padding: "20px",
                border: "1px solid #e0e0e0",
                backgroundColor: "#fff",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >
                <h2>New Email</h2>
                
                <Button type="default" onClick={() => window.history.back()}>
                    Cancel
                </Button>
            </header>
            <Form layout="vertical">
                <Form.Item label="To">
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Item>
                <Form.Item label="Subject">
                    <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </Form.Item>
                <Form.Item label="Google Meet Link (Optional)">
                    <Input
                        value={googleMeetLink}
                        onChange={(e) => setGoogleMeetLink(e.target.value)}
                    />
                </Form.Item>
                <Form.Item label="Message">
                    <Input.TextArea
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                    />
                </Form.Item>
            </Form>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="primary" onClick={handleSend} loading={loading}>
                    Send
                </Button>
            </div>
        </div>
    );
};

export default NewMail;
