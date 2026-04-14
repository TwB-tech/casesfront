import React, {useEffect, useState} from 'react';
import { Table, Button, Tag, Card, Statistic } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Download, Clock, CheckCircle, AlertCircle, DollarSign, Search as SearchOutlined } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Breadcrumbs from '../ui/Breadcrumbs';
import axiosInstance from '../../axiosConfig'

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const { isFuturistic, themeConfig } = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = window.innerWidth < 768;

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/invoices')
      .then(response => {
        setInvoices(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error fetching the invoices!', error);
        // Fallback sample data
        setInvoices([
          { id: 1, invoiceNumber: 'INV-2024-001', clientName: 'Acme Corporation', date: '2024-04-10', totalAmount: 4500, status: 'paid' },
          { id: 2, invoiceNumber: 'INV-2024-002', clientName: 'Global Industries', date: '2024-04-08', totalAmount: 3200, status: 'pending' },
          { id: 3, invoiceNumber: 'INV-2024-003', clientName: 'Tech Solutions Ltd', date: '2024-04-05', totalAmount: 6800, status: 'paid' },
          { id: 4, invoiceNumber: 'INV-2024-004', clientName: 'Legal Partners Inc', date: '2024-04-03', totalAmount: 2900, status: 'overdue' },
          { id: 5, invoiceNumber: 'INV-2024-005', clientName: 'Smith & Associates', date: '2024-04-01', totalAmount: 5400, status: 'paid' },
        ]);
        setLoading(false);
      });
  }, []);

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchQuery || 
      invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      render: (num) => <span className="font-medium">{num}</span>,
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
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <span className="font-semibold">${amount?.toLocaleString() || 0}</span>
      ),
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          paid: { color: 'success', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
          pending: { color: 'warning', icon: <Clock className="w-3 h-3 mr-1" /> },
          overdue: { color: 'error', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag color={config.color} icon={config.icon}>
            {status}
          </Tag>
        );
      },
      filters: [
        { text: 'Paid', value: 'paid' },
        { text: 'Pending', value: 'pending' },
        { text: 'Overdue', value: 'overdue' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => (
        <div className="flex gap-2">
          <Button size="small" type="link" onClick={() => invoiceDetails(record)}>View</Button>
          <Button size="small" type="link">Download</Button>
        </div>
      ),
    },
  ];

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const pendingCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;

  return (
    <div className="min-h-screen">
      <Breadcrumbs />
      
      {/* Header Section */}
      <div className={`relative overflow-hidden rounded-2xl mb-8 p-8 ${
        isFuturistic 
          ? 'bg-gradient-to-br from-cyber-surface via-cyber-bg to-cyber-card border border-cyber-border' 
          : 'bg-gradient-to-br from-primary-50 to-white border border-primary-100'
      }`}>
        {isFuturistic && (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-aurora-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-aurora-secondary/10 rounded-full blur-3xl" />
          </>
        )}
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
                isFuturistic ? 'text-aurora-text' : 'text-primary-900'
              }`}>
                Invoices
              </h1>
              <p className={`text-lg ${
                isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
              }`}>
                Manage and track all client invoices
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                type="primary" 
                size="large"
                icon={<Plus className="w-4 h-4" />}
                className={isFuturistic ? 'futuristic-btn' : ''}
                style={{ background: isFuturistic ? themeConfig.accent : undefined }}
                onClick={handleNewInvoice}
              >
                New Invoice
              </Button>
              <Button 
                size="large"
                icon={<Download className="w-4 h-4" />}
                className={isFuturistic ? 'border-cyber-border' : ''}
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

       {/* Search & Filter Bar - Always at top */}
       <div className={`mb-6 p-4 rounded-xl ${isFuturistic ? 'bg-cyber-card border border-cyber-border' : 'bg-white border border-neutral-200'}`}>
         <div className="flex flex-col sm:flex-row gap-3">
           <div className="flex-1">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
               <input
                 type="text"
                 placeholder="Search invoices by number or client name..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                   isFuturistic 
                     ? 'bg-cyber-bg border-cyber-border text-aurora-text' 
                     : 'bg-white border-neutral-300 text-neutral-800'
                 } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                 style={{ width: '100%' }}
               />
             </div>
           </div>
           <select
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className={`px-4 py-3 rounded-lg border ${
               isFuturistic 
                 ? 'bg-cyber-bg border-cyber-border text-aurora-text' 
                 : 'bg-white border-neutral-300 text-neutral-800'
             } focus:outline-none focus:ring-2 focus:ring-primary-500`}
             style={{ minWidth: '150px' }}
           >
             <option value="All">All Status</option>
             <option value="paid">Paid</option>
             <option value="pending">Pending</option>
             <option value="overdue">Overdue</option>
           </select>
         </div>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isFuturistic ? 'bg-aurora-primary/20' : 'bg-blue-100'
            }`}>
              <FileText className={`w-6 h-6 ${isFuturistic ? 'text-aurora-primary' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>Total Invoiced</p>
              <p className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
                ${totalInvoiced.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isFuturistic ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${isFuturistic ? 'text-green-500' : 'text-green-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>Total Paid</p>
              <p className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
                ${totalPaid.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isFuturistic ? 'bg-yellow-500/20' : 'bg-yellow-100'
            }`}>
              <Clock className={`w-6 h-6 ${isFuturistic ? 'text-yellow-500' : 'text-yellow-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>Pending Payment</p>
              <p className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
                {pendingCount} invoices
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card 
        className={`${isFuturistic ? 'bg-cyber-card border-cyber-border' : ''}`}
        styles={{ body: { padding: '24px' } }}
      >
         <Table 
           dataSource={filteredInvoices} 
           columns={columns} 
           rowKey="id" 
           style={{ overflowX: 'auto' }}
           scroll={{ x: 'max-content' }}
           pagination={{
             pageSize: 10,
             showSizeChanger: true,
             showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} invoices`
           }}
         />
      </Card>
    </div>
  )
};

export default InvoiceList;
