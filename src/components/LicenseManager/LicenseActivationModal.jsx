import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Typography, Space, Alert } from 'antd';
import {
  LockOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useLicense } from '../../contexts/LicenseContext';
import { generateInstallationId, isValidLicenseFormat } from '../../utils/license';

const { Title, Text } = Typography;

const LicenseActivationModal = ({ visible, onClose, isAdmin = false }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const { activation, trial, deactivateLicense } = useLicense();

  const handleVerify = async (values) => {
    const { licenseKey } = values;

    if (!isValidLicenseFormat(licenseKey)) {
      message.error('Invalid license key format. Expected: TWB-LF-XXXX-XXXX-XXXX-XXXX');
      return;
    }

    setLoading(true);

    // Simulate short delay for user feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    const installationId = generateInstallationId();
    const result =
      (await window.verifyLicenseKey?.(licenseKey, installationId)) ||
      require('../../utils/license').verifyLicenseKey?.(licenseKey, installationId);

    setVerificationResult(result);
    setShowVerification(true);
    setLoading(false);
  };

  const handleActivate = async () => {
    const values = await form.validateFields();
    setLoading(true);

    const installationId = generateInstallationId();
    const { activateLicense } = await import('../../utils/license');
    const result = activateLicense(
      values.licenseKey,
      values.clientName || activation?.clientName,
      installationId
    );

    if (result.success) {
      message.success('License activated successfully!');
      form.resetFields();
      setShowVerification(false);
      setVerificationResult(null);
      onClose?.();
    } else {
      message.error(result.message || 'Activation failed');
    }
    setLoading(false);
  };

  const handleRetry = () => {
    setShowVerification(false);
    setVerificationResult(null);
    form.setFieldsValue({ licenseKey: '' });
  };

  const handleCancel = () => {
    form.resetFields();
    setShowVerification(false);
    setVerificationResult(null);
    onClose?.();
  };

  // Auto-show on first visit if not activated and trial expired
  useEffect(() => {
    if (visible && !isAdmin) {
      const isActivated = activation?.activated;
      const isTrialValid = trial?.inTrial;
      if (!isActivated && !isTrialValid) {
        // Force close handler to be called after activation/trial check
      }
    }
  }, [visible, activation, trial, isAdmin]);

  const renderVerificationResult = () => {
    if (!verificationResult) {
      return null;
    }

    const { valid, reason, message: msg, license } = verificationResult;

    return (
      <div style={{ marginTop: 16 }}>
        <Alert
          type={valid ? 'success' : 'error'}
          showIcon
          message={
            <Space>
              {valid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              <span>{msg}</span>
            </Space>
          }
          description={
            valid ? (
              <div>
                <p>
                  <strong>Client:</strong> {license?.clientName}
                </p>
                <p>
                  <strong>Organization:</strong> {license?.organization}
                </p>
                <p>
                  <strong>Expires:</strong> {new Date(license?.expiryDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Payment Status:</strong>{' '}
                  {license?.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                </p>
                {license?.amount && (
                  <p>
                    <strong>License Fee:</strong> KES {license.amount.toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p>Reason: {reason}</p>
                {reason === 'expired' && license && (
                  <p>Expired on: {new Date(license.expiryDate).toLocaleDateString()}</p>
                )}
                {reason === 'wrong_domain' && <p>Please contact support to update your domain.</p>}
              </div>
            )
          }
          style={{ marginBottom: 16 }}
        />

        {valid && (
          <Button type="primary" onClick={handleActivate} loading={loading} block size="large">
            Confirm Activation
          </Button>
        )}

        {!valid && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button onClick={handleRetry} block>
              Try Different Key
            </Button>
            {reason === 'no_licenses' && isAdmin && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                No licenses have been generated yet. Go to Admin Dashboard → License Management to
                create one.
              </Text>
            )}
          </Space>
        )}
      </div>
    );
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={520}
      centered
      destroyOnClose
      title={
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <LockOutlined style={{ fontSize: 32, color: '#8b5cf6', marginBottom: 8 }} />
          <Title level={4} style={{ margin: 0 }}>
            {activation?.activated ? 'License Information' : 'Activate Your License'}
          </Title>
          <Text type="secondary">
            {activation?.activated
              ? 'Your software license is active'
              : 'Enter your license key to activate the WakiliWorld CRM'}
          </Text>
        </div>
      }
    >
      {activation?.activated && !showVerification ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={4}>Software is Licensed</Title>
          <p>
            <strong>Client:</strong> {activation.clientName}
          </p>
          <p>
            <strong>License Key:</strong> <Text code>{activation.licenseKey}</Text>
          </p>
          <p>
            <strong>Expires:</strong> {new Date(activation.expiryDate).toLocaleDateString()}
          </p>
          <p>
            <Text type={activation.isExpiringSoon ? 'warning' : 'secondary'}>
              {activation.daysRemaining > 0
                ? `${activation.daysRemaining} days remaining`
                : 'Expired'}
            </Text>
          </p>
          {activation.maintenanceDue && (
            <Alert
              type="warning"
              message="Quarterly maintenance fee due"
              description="Please ensure your maintenance payments are up to date."
              style={{ marginTop: 16 }}
            />
          )}
          <div style={{ marginTop: 24 }}>
            <Button
              danger
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to deactivate? This will restrict access to the software.'
                  )
                ) {
                  deactivateLicense();
                  handleCancel();
                }
              }}
            >
              Deactivate License
            </Button>
          </div>
        </div>
      ) : !showVerification ? (
        <Form
          form={form}
          onFinish={handleVerify}
          layout="vertical"
          disabled={!!activation?.activated}
        >
          <Alert
            type="info"
            message="License Activation"
            description="Enter your license key to activate WakiliWorld CRM. The key is provided by Tech with Brands (TwB) after purchase."
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="licenseKey"
            label="License Key"
            rules={[
              { required: true, message: 'Please enter your license key' },
              {
                validator: (_, value) =>
                  !value || isValidLicenseFormat(value)
                    ? Promise.resolve()
                    : Promise.reject(new Error('Invalid format. Use: TWB-LF-XXXX-XXXX-XXXX-XXXX')),
              },
            ]}
          >
            <Input
              placeholder="TWB-LF-1234-5678-9012-3456"
              size="large"
              prefix={<KeyOutlined />}
              style={{ fontFamily: 'monospace', letterSpacing: '2px' }}
            />
          </Form.Item>

          <Form.Item
            name="clientName"
            label="Client Name (Optional)"
            tooltip="Pre-fills from license record if left blank"
          >
            <Input placeholder="Law Firm or Organization Name" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Verify & Activate
            </Button>
          </Form.Item>

          {!isAdmin && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Need a license? Contact{' '}
                <a href="mailto:support@techwithbrands.com">support@techwithbrands.com</a>
              </Text>
            </div>
          )}
        </Form>
      ) : (
        renderVerificationResult()
      )}
    </Modal>
  );
};

export default LicenseActivationModal;
