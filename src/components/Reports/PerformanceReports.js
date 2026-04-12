import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Progress, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';

function PerformanceReports() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    axiosInstance.get('/case/').then((response) => {
      setCases(response.data.results || []);
    });
  }, []);

  const performanceData = useMemo(() => {
    const grouped = cases.reduce((acc, item) => {
      const key = item.advocate?.username || 'Unassigned';
      if (!acc[key]) {
        acc[key] = { key, lawyerName: key, casesHandled: 0, casesWon: 0, successRate: 0 };
      }
      acc[key].casesHandled += 1;
      if (item.status === 'closed') {
        acc[key].casesWon += 1;
      }
      return acc;
    }, {});

    return Object.values(grouped).map((entry) => ({
      ...entry,
      successRate: entry.casesHandled ? Math.round((entry.casesWon / entry.casesHandled) * 100) : 0,
    }));
  }, [cases]);

  const columns = [
    {
      title: 'Lawyer Name',
      dataIndex: 'lawyerName',
      key: 'lawyerName',
    },
    {
      title: 'Cases Handled',
      dataIndex: 'casesHandled',
      key: 'casesHandled',
    },
    {
      title: 'Cases Closed',
      dataIndex: 'casesWon',
      key: 'casesWon',
    },
    {
      title: 'Completion Rate',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (value) => <Progress percent={value} status="active" />,
    },
  ];

  return (
    <Card
      title="Performance Reports"
      extra={<Button type="primary" icon={<DownloadOutlined />}>Download Report</Button>}
      style={{ margin: '20px' }}
    >
      <Table
        dataSource={performanceData}
        columns={columns}
        pagination={{ pageSize: 5 }}
        style={{ overflowX: 'auto', cursor: 'pointer' }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
}

export default PerformanceReports;
