import React, { useState, useEffect } from 'react';
import { Button, message, Spin } from 'antd';
import {
  CheckCircleOutlined,
  MobileOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  RocketOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import axiosInstance from '../axiosConfig';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';
/* eslint-disable no-console */

const Pricing = () => {
  const { isFuturistic } = useTheme();
  const [loading, setLoading] = useState(false);
  const [processingTier, setProcessingTier] = useState(null);
  const [message_content, setMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderID = params.get('paypal_order');
    const sub = params.get('sub');
    if (orderID && sub) {
      handlePaypalCapture(orderID, sub);
    }
  }, []);

  const handlePaypalCapture = async (orderID, sub) => {
    setLoading(true);
    try {
      await axiosInstance.post('/billing/paypal/capture/', {
        order_id: orderID,
        subscription_id: sub,
      });
      setMessage({ type: 'success', text: 'Payment confirmed - subscription active.' });
      message.success('Payment confirmed - subscription active.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Payment capture failed.' });
      message.error('Payment capture failed.');
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (tier, method) => {
    setLoading(true);
    setProcessingTier(`${tier}-${method}`);
    setMessage(null);
    try {
      const res = await axiosInstance.post('/billing/subscribe/', { tier, payment_method: method });
      const data = res.data || {};
      if (data.approval_url) {
        window.location.href = data.approval_url;
        return;
      }
      if (data.checkout_request_id) {
        setMessage({
          type: 'info',
          text: 'M-Pesa STK Push initiated. Check your phone to complete payment.',
        });
        message.info('M-Pesa STK Push initiated. Check your phone to complete payment.');
        return;
      }
      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      if (data.message) {
        setMessage({ type: 'success', text: data.message });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to start subscription. Please try again.' });
      message.error('Failed to start subscription.');
    } finally {
      setLoading(false);
      setProcessingTier(null);
    }
  };

  const plans = [
    {
      key: 'basic',
      name: 'Basic',
      price: '$10',
      period: 'per user / month',
      description: 'Perfect for solo practitioners and small firms getting started.',
      icon: RocketOutlined,
      color: isFuturistic ? 'from-neutral-500 to-neutral-600' : 'from-primary-400 to-primary-500',
      features: [
        'Case Management',
        'Client Management',
        'Document Storage (5GB)',
        'Task Management',
        'Email Support',
        'Basic Analytics',
      ],
      notIncluded: [
        'AI Assistant (Reya)',
        'Paralegal Marketplace',
        'Priority Support',
        'API Access',
      ],
      popular: false,
    },
    {
      key: 'pro',
      name: 'Professional',
      price: '$30',
      period: 'per user / month',
      description: 'For growing firms that need advanced features and automation.',
      icon: CrownOutlined,
      color: isFuturistic
        ? 'from-aurora-primary to-aurora-secondary'
        : 'from-primary-600 to-accent-500',
      features: [
        'Everything in Basic',
        'AI Assistant (Reya)',
        'Paralegal Marketplace Access',
        'Document Storage (50GB)',
        'Advanced Analytics',
        'Priority Support',
        'Calendar Integration',
        'Billing & Invoicing',
      ],
      notIncluded: ['API Access', 'Custom Integrations'],
      popular: true,
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'tailored pricing',
      description: 'For large firms requiring full customization and support.',
      icon: TeamOutlined,
      color: isFuturistic ? 'from-neutral-600 to-neutral-700' : 'from-primary-700 to-primary-800',
      features: [
        'Everything in Professional',
        'Unlimited Document Storage',
        'API Access',
        'Custom Integrations',
        'Dedicated Account Manager',
        '24/7 Phone Support',
        'Custom Training',
        'SLA Guarantee',
      ],
      notIncluded: [],
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Can I change plans later?',
      answer:
        'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept PayPal and M-Pesa for African customers. Enterprise customers can arrange invoice-based payments.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, all plans come with a 14-day free trial. No credit card required.',
    },
    {
      question: 'What happens to my data if I cancel?',
      answer:
        'You can export all your data at any time before cancellation. We retain data for 30 days after cancellation.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumbs />

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Spin size="large" />
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-16">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            isFuturistic ? 'bg-aurora-primary/10 border border-aurora-primary/30' : 'bg-primary-50'
          }`}
        >
          <ThunderboltOutlined
            className={isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}
          />
          <span
            className={`text-sm font-medium ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}
          >
            Simple, Transparent Pricing
          </span>
        </div>
        <h1
          className={`text-4xl md:text-5xl font-bold mb-4 ${
            isFuturistic ? 'text-aurora-text' : 'text-primary-900'
          }`}
        >
          Choose Your Plan
        </h1>
        <p
          className={`text-lg max-w-2xl mx-auto ${
            isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
          }`}
        >
          Start with a 14-day free trial. No credit card required.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
              plan.popular
                ? isFuturistic
                  ? 'ring-2 ring-aurora-primary shadow-glow-lg'
                  : 'ring-2 ring-primary-500 shadow-xl'
                : isFuturistic
                  ? 'bg-cyber-card border border-cyber-border'
                  : 'bg-white border border-neutral-200 shadow-sm'
            }`}
          >
            {plan.popular && (
              <div
                className={`absolute top-0 left-0 right-0 py-2 text-center text-sm font-semibold ${
                  isFuturistic
                    ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white'
                    : 'bg-gradient-to-r from-primary-600 to-accent-500 text-white'
                }`}
              >
                Most Popular
              </div>
            )}

            <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  isFuturistic
                    ? 'bg-gradient-to-br from-aurora-primary/20 to-aurora-secondary/20'
                    : 'bg-gradient-to-br from-primary-100 to-accent-100'
                }`}
              >
                <plan.icon
                  className={`text-2xl ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}
                />
              </div>

              <h3
                className={`text-xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
              >
                {plan.name}
              </h3>
              <p
                className={`text-sm mb-4 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
              >
                {plan.description}
              </p>

              <div className="mb-6">
                <span
                  className={`text-4xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
                >
                  {plan.price}
                </span>
                {plan.price !== 'Custom' && (
                  <span
                    className={`text-sm ml-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              <div className={`space-y-3 mb-8`}>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircleOutlined
                      className={isFuturistic ? 'text-success text-sm' : 'text-success-500 text-sm'}
                    />
                    <span
                      className={`text-sm ${isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.notIncluded.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 opacity-50">
                    <div className="w-4 h-4 rounded-full border-2 border-neutral-400" />
                    <span
                      className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button
                  type={plan.popular ? 'primary' : 'default'}
                  size="large"
                  block
                  loading={processingTier === `${plan.key}-paypal`}
                  onClick={() => subscribe(plan.key, 'paypal')}
                  className={isFuturistic && plan.popular ? 'futuristic-btn' : ''}
                  style={{
                    background:
                      isFuturistic && plan.popular
                        ? undefined
                        : !plan.popular
                          ? isFuturistic
                            ? 'transparent'
                            : '#ffffff'
                          : undefined,
                    borderColor: isFuturistic && !plan.popular ? '#2a2a3a' : undefined,
                    color: isFuturistic && !plan.popular ? '#f8fafc' : undefined,
                  }}
                >
                  Pay with PayPal
                </Button>
                <Button
                  size="large"
                  block
                  loading={processingTier === `${plan.key}-mpesa`}
                  onClick={() => subscribe(plan.key, 'mpesa')}
                  icon={<MobileOutlined />}
                  style={{
                    background: isFuturistic ? 'transparent' : '#ffffff',
                    borderColor: isFuturistic ? '#2a2a3a' : '#d9e2ec',
                    color: isFuturistic ? '#f8fafc' : '#1a1a1a',
                  }}
                >
                  Pay with M-Pesa
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message */}
      {message_content && (
        <div
          className={`mb-8 p-4 rounded-xl text-center ${
            message_content.type === 'success'
              ? isFuturistic
                ? 'bg-success/20 text-success'
                : 'bg-success-50 text-success-700'
              : message_content.type === 'error'
                ? isFuturistic
                  ? 'bg-danger/20 text-danger'
                  : 'bg-red-50 text-red-700'
                : isFuturistic
                  ? 'bg-aurora-primary/20 text-aurora-primary'
                  : 'bg-primary-50 text-primary-700'
          }`}
        >
          {message_content.text}
        </div>
      )}

      {/* FAQ Section */}
      <div
        className={`rounded-2xl p-8 ${
          isFuturistic
            ? 'bg-cyber-card border border-cyber-border'
            : 'bg-white border border-neutral-200 shadow-sm'
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-8 text-center ${
            isFuturistic ? 'text-aurora-text' : 'text-primary-900'
          }`}
        >
          Frequently Asked Questions
        </h2>

        <div className="grid gap-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl ${isFuturistic ? 'bg-cyber-bg' : 'bg-neutral-50'}`}
            >
              <h3
                className={`font-semibold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
              >
                {faq.question}
              </h3>
              <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className={`mt-12 text-center p-8 rounded-2xl ${
          isFuturistic
            ? 'bg-gradient-to-r from-aurora-primary/20 to-aurora-secondary/20 border border-aurora-primary/30'
            : 'bg-gradient-to-r from-primary-50 to-accent-50'
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-4 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
        >
          Still Have Questions?
        </h2>
        <p className={`mb-6 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
          Our team is here to help you choose the right plan for your practice.
        </p>
        <Button size="large" type="primary" className={isFuturistic ? 'futuristic-btn' : ''}>
          Contact Sales
        </Button>
      </div>
    </div>
  );
};

export default Pricing;
