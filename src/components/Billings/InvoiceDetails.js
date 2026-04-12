import React from 'react';
import { Button } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const [invoice, setInvoice] = React.useState(state?.invoice || null);

  React.useEffect(() => {
    if (invoice) return;
    axiosInstance.get('/api/invoices').then((response) => {
      const found = response.data.find((item) => String(item.id) === String(id));
      setInvoice(found || null);
    });
  }, [id, invoice]);

  if (!invoice) {
    return <div style={{ marginTop: '40px' }}>Invoice not found.</div>;
  }

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        }}
      >
        <div
          style={{
            fontSize: window.innerWidth < 768 ? '20px' : '24px',
            fontWeight: 'bold',
            color: '#333',
            textAlign: window.innerWidth < 768 ? 'center' : 'left',
          }}
        >
          LAW FIRM COMPANY
        </div>
        <div style={{ textAlign: 'right', marginTop: window.innerWidth < 768 ? '10px' : '0' }}>
          <div>Invoice: {invoice.invoiceNumber}</div>
          <div>Date: {invoice.date}</div>
        </div>
      </header>

      <section style={{ marginBottom: '20px', textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
        <h3>Bill to:</h3>
        <p>{invoice.clientName}</p>
        <p>{invoice.clientAddress}</p>
        <p>CRN: {invoice.crn}</p>
      </section>

      <section style={{ marginBottom: '20px', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '20px',
          }}
        >
          <thead>
            <tr>
              <th style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'left' }}>SL.</th>
              <th style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'left' }}>Item Description</th>
              <th style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'left' }}>Rate</th>
              <th style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'left' }}>Hours</th>
              <th style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'left' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'left' }}>{index + 1}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'left' }}>{item.description}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'left' }}>{item.rate}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'left' }}>{item.hours}</td>
                <td style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'left' }}>{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          textAlign: window.innerWidth < 768 ? 'center' : 'left',
        }}
      >
        <div>
          <h3>Payment Info:</h3>
          <p>Account number: {invoice.accountNumber}</p>
          <p>Account name: {invoice.accountName}</p>
          <p>Bank detail: {invoice.bankDetail}</p>
        </div>
        <div style={{ marginTop: window.innerWidth < 768 ? '20px' : '0' }}>
          <div>Total: {invoice.total}</div>
          <div>Tax: {invoice.tax}</div>
          <div>Amount Due: {invoice.amountDue}</div>
        </div>
      </section>

      <footer
        style={{
          textAlign: 'center',
          fontSize: '12px',
          marginTop: '20px',
          borderTop: '1px solid #e0e0e0',
          paddingTop: '10px',
        }}
      >
        <p>Terms & Conditions: {invoice.terms}</p>
        <div style={{ marginTop: '20px', fontWeight: 'bold' }}>Authorized Signature</div>
      </footer>
      
      <Button
        onClick={() => navigate('/invoices')}
        style={{ marginRight: 12 }}
      >
        Back
      </Button>
      <Button
        onClick={() => window.print()}
        type="primary"
        style={{
          display: 'block',
          width: window.innerWidth < 768 ? '100%' : 'auto',
          margin: '20px auto 0',
        }}
      >
        Print
      </Button>
    </div>
  );
};

export default InvoiceDetails;
