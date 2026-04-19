import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, InputNumber, Row, Col, Divider, message } from 'antd';
import axiosInstance from '../../axiosConfig';
import moment from 'moment';
import { useCurrency } from '../../contexts/CurrencyContext';
import { CURRENCIES } from '../../utils/currency';

const generateInvoiceNumber = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let invoiceNumber = '';
  for (let i = 0; i < 7; i++) {
    invoiceNumber += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return invoiceNumber;
};

const NewInvoice = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(() => generateInvoiceNumber());
  const { currency } = useCurrency();

  useEffect(() => {
    form.setFieldsValue({ date: moment() });
  }, [form]);

  const onFinish = (values) => {
    setLoading(true);
    values.invoiceNumber = invoiceNumber;
    axiosInstance
      .post('/api/invoices', values)
      .then(() => {
        message.success('Invoice created successfully!');
        form.resetFields();
        setInvoiceNumber(generateInvoiceNumber());
      })
      .catch((_error) => {
        message.error('There was an error creating the invoice!');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const currencySymbol = CURRENCIES[currency]?.symbol || '$';

  return (
    <div
      style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <header style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                WAKILI_HUB LAW FIRM
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="invoiceNumber" label="Invoice Number">
                <Input value={invoiceNumber} placeholder={invoiceNumber} disabled />
              </Form.Item>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </header>

        <section style={{ marginBottom: '20px' }}>
          <h3>Bill to:</h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item name="clientName" label="Client Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="clientAddress" label="Client Address" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="crn" label="CRN" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <h3>Items:</h3>
          <Form.List
            name="items"
            rules={[{ required: true, message: 'Please add at least one item' }]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Row gutter={[16, 16]} key={key}>
                    <Col xs={24} md={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        fieldKey={[fieldKey, 'description']}
                        rules={[{ required: true, message: 'Missing item description' }]}
                      >
                        <Input placeholder="Item Description" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'rate']}
                        fieldKey={[fieldKey, 'rate']}
                        rules={[{ required: true, message: 'Missing rate' }]}
                      >
                        <InputNumber
                          min={0}
                          prefix={currencySymbol}
                          placeholder="Rate"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'hours']}
                        fieldKey={[fieldKey, 'hours']}
                        rules={[{ required: true, message: 'Missing hours' }]}
                      >
                        <InputNumber min={0} placeholder="Hours" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'total']}
                        fieldKey={[fieldKey, 'total']}
                        rules={[{ required: true, message: 'Missing total' }]}
                      >
                        <InputNumber
                          min={0}
                          prefix={currencySymbol}
                          placeholder="Total"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={2}>
                      <Button type="link" onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Add Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </section>

        <Divider />

        <section style={{ marginBottom: '20px' }}>
          <Row gutter={[16, 16]} justify="space-between">
            <Col xs={24} md={12}>
              <h3>Payment Info:</h3>
              <Form.Item name="accountNumber" label="Account Number" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="accountName" label="Account Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="bankDetail" label="Bank Detail" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="total" label="Total" rules={[{ required: true }]}>
                <InputNumber min={0} prefix={currencySymbol} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="tax" label="Tax" rules={[{ required: true }]}>
                <InputNumber min={0} prefix={currencySymbol} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="amountDue" label="Amount Due" rules={[{ required: true }]}>
                <InputNumber min={0} prefix={currencySymbol} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
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
          <h3>Terms & Conditions:</h3>
          <Form.Item name="terms" label="Terms & Conditions" rules={[{ required: true }]}>
            <Input.TextArea
              rows={4}
              placeholder="Enter unique terms & conditions for this invoice"
            />
          </Form.Item>
          <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
            <Form.Item name="signature" label="Authorized Signature" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>
        </footer>

        <Button type="primary" htmlType="submit" loading={loading} block>
          Create Invoice
        </Button>
      </Form>
    </div>
  );
};

export default NewInvoice;
