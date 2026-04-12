import React, {useEffect, useState} from 'react';
import { Table, Button } from 'antd';
import {useNavigate} from 'react-router-dom'
import axiosInstance from '../../axiosConfig'

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  
  const navigate = useNavigate()

  useEffect(() => {
    axiosInstance.get('/api/invoices')
      .then(response => {
        setInvoices(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the invoices!', error);
      });
  }, []);


  const invoiceDetails = (invoice) => {
      navigate(`/invoice-details/${invoice.id}`, { state: { invoice } });
  }

  const handleNewInvoice = () => {
    navigate('/new-invoice')
  }


  const columns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Client Name',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button type="link" onClick={() => invoiceDetails(record)}>View Details</Button>
      ),
    },
  ];

  return (
    <>
  <div style={{display:"flex", justifyContent:"space-between", marginTop:"40px", marginBottom:"20px" }}>
    <h2>Invoices</h2>
    <Button type='primary' onClick={handleNewInvoice}>
      New Invoice 
    </Button>
  </div>
  <Table 
  dataSource={invoices} 
  columns={columns} 
  rowKey="invoiceNumber" 
  style={{ overflowX: 'auto', cursor: 'pointer' }}
  scroll={{ x: 'max-content' }}
  />
  </>
)
};

export default InvoiceList;
