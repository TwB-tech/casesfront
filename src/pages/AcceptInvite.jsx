import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, CheckCircle } from 'lucide-react';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        message.error('Invalid invitation link');
        navigate('/login');
        return;
      }

      try {
        // In a real implementation, you'd validate the token server-side
        // For now, we'll assume it's valid if present
        setInviteValid(true);
        setInviteData({ email: 'employee@example.com', role: 'employee' });
      } catch (error) {
        message.error('Invalid or expired invitation');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // For now, just simulate success and redirect
      console.log('Accepting invite with:', { token, ...values });
      message.success('Account created successfully!');

      setCompleted(true);

      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Account creation error:', error);
      message.error('Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 mb-4">This invitation link is invalid or has expired.</p>
          <Button type="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-green-600 mb-4">Account Created!</h2>
          <p className="text-gray-600 mb-4">
            Your account has been created successfully. You can now log in to access your firm's
            workspace.
          </p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <UserPlus className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Join Your Team</h1>
          <p className="text-gray-600 mt-2">
            Set up your account to start collaborating with your team
          </p>
        </div>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>

          <Form.Item label="Email">
            <Input value={inviteData?.email} disabled />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password placeholder="Create a strong password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="w-full"
              size="large"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/login" className="text-blue-500 hover:text-blue-600">
              Sign in
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AcceptInvite;
