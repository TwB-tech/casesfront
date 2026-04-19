import React from 'react';
import { Button, Card, Tag } from 'antd';
import { Printer, ArrowLeft, Download, CheckCircle, Clock } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Breadcrumbs from '../ui/Breadcrumbs';
import axiosInstance from '../../axiosConfig';

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const { isFuturistic, themeConfig } = useTheme();
  const [invoice, setInvoice] = React.useState(state?.invoice || null);

  React.useEffect(() => {
    if (invoice) {
      return;
    }
    const fetchInvoice = async () => {
      try {
        const response = await axiosInstance.get(`/api/invoices/${id}/`);
        setInvoice(response.data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      }
    };
    fetchInvoice();
  }, [id, invoice]);

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invoice not found.</p>
      </div>
    );
  }

  const statusConfig = {
    paid: { color: 'success', icon: <CheckCircle className="w-4 h-4 mr-1" /> },
    pending: { color: 'warning', icon: <Clock className="w-4 h-4 mr-1" /> },
    overdue: { color: 'error', icon: <Clock className="w-4 h-4 mr-1" /> },
  };
  const status = statusConfig[invoice.status] || statusConfig.pending;

  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1
            className={`text-3xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
          >
            Invoice {invoice.invoiceNumber}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Tag color={status.color} icon={status.icon}>
              {invoice.status || 'Pending'}
            </Tag>
            <span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>
              Date: {invoice.date}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/invoices')}
            className={isFuturistic ? 'border-cyber-border' : ''}
          >
            Back to Invoices
          </Button>
          <Button
            icon={<Download className="w-4 h-4" />}
            className={isFuturistic ? 'border-cyber-border' : ''}
          >
            Download PDF
          </Button>
          <Button
            type="primary"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
            className={isFuturistic ? 'futuristic-btn' : ''}
            style={{ background: isFuturistic ? themeConfig.accent : undefined }}
          >
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <Card
        className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
        styles={{ body: { padding: '40px' } }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div
            className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8 pb-8 border-b"
            style={{ borderColor: isFuturistic ? '#2a2a3a' : '#e2e8f0' }}
          >
            <div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: isFuturistic ? themeConfig.accent : '#3b82f6' }}
              >
                WAKILWORLD
              </h2>
              <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
                Your trusted legal partner
              </p>
            </div>
            <div className="text-right">
              <h3
                className={`text-xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                INVOICE
              </h3>
              <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>
                #{invoice.invoiceNumber}
              </p>
              <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>
                Date: {invoice.date}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <h4
              className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
            >
              Bill To:
            </h4>
            <p
              className={`text-lg font-medium ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
            >
              {invoice.clientName}
            </p>
            <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
              {invoice.clientAddress}
            </p>
            {invoice.crn && (
              <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
                CRN: {invoice.crn}
              </p>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`border-b ${isFuturistic ? 'border-cyber-border' : 'border-neutral-200'}`}
                >
                  <th
                    className={`text-left py-3 px-4 text-sm font-semibold ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                  >
                    #
                  </th>
                  <th
                    className={`text-left py-3 px-4 text-sm font-semibold ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                  >
                    Description
                  </th>
                  <th
                    className={`text-right py-3 px-4 text-sm font-semibold ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                  >
                    Rate
                  </th>
                  <th
                    className={`text-right py-3 px-4 text-sm font-semibold ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                  >
                    Hours
                  </th>
                  <th
                    className={`text-right py-3 px-4 text-sm font-semibold ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b ${isFuturistic ? 'border-cyber-border' : 'border-neutral-100'}`}
                  >
                    <td
                      className={`py-4 px-4 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}`}
                    >
                      {index + 1}
                    </td>
                    <td
                      className={`py-4 px-4 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}`}
                    >
                      {item.description}
                    </td>
                    <td
                      className={`py-4 px-4 text-right ${isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}`}
                    >
                      ${item.rate}
                    </td>
                    <td
                      className={`py-4 px-4 text-right ${isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}`}
                    >
                      {item.hours}
                    </td>
                    <td
                      className={`py-4 px-4 text-right font-medium ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
                    >
                      ${item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-8">
            <div className="md:w-1/2">
              <h4
                className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
              >
                Payment Information:
              </h4>
              <p className={isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}>
                <strong>Account:</strong> {invoice.accountNumber}
              </p>
              <p className={isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}>
                <strong>Name:</strong> {invoice.accountName}
              </p>
              <p className={isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}>
                <strong>Bank:</strong> {invoice.bankDetail}
              </p>
            </div>
            <div className="md:w-1/3">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
                    Subtotal:
                  </span>
                  <span className={isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}>
                    ${invoice.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
                    Tax:
                  </span>
                  <span className={isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}>
                    ${invoice.tax}
                  </span>
                </div>
                <div
                  className={`flex justify-between pt-3 border-t ${isFuturistic ? 'border-cyber-border' : 'border-neutral-200'}`}
                >
                  <span
                    className={`text-lg font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
                  >
                    Total Due:
                  </span>
                  <span
                    className={`text-lg font-bold ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}
                  >
                    ${invoice.amountDue}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          {invoice.terms && (
            <div
              className="pt-8 border-t"
              style={{ borderColor: isFuturistic ? '#2a2a3a' : '#e2e8f0' }}
            >
              <h4
                className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
              >
                Terms & Conditions:
              </h4>
              <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
                {invoice.terms}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetails;
