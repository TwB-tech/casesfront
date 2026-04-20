import React from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const plans = [
  {
    name: 'Starter',
    kPrice: 4990,
    period: 'per user / month',
    description: 'Perfect for solo practitioners and small teams.',
    features: [
      'Case Management',
      'Client Management',
      'Document Storage (5GB)',
      'Task Management',
      'Email Support',
      'Basic Analytics',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    kPrice: 9990,
    period: 'per user / month',
    description: 'For growing firms that need advanced features.',
    features: [
      'Everything in Starter',
      'AI Assistant (Reya)',
      'Document Storage (50GB)',
      'Advanced Analytics',
      'Priority Support',
      'Calendar Integration',
      'Billing & Invoicing',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    kPrice: null,
    period: 'contact for pricing',
    description: 'For large firms requiring full customization.',
    features: [
      'Everything in Professional',
      'Unlimited Storage',
      'API Access',
      'Custom Integrations',
      'Dedicated Account Manager',
      '24/7 Phone Support',
      'Custom Training',
    ],
    popular: false,
  },
];

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time.',
  },
  { question: 'Is there a free trial?', answer: 'Yes, we offer a 14-day free trial on all plans.' },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept M-Pesa, bank transfers, and card payments.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time with no penalties.',
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#000000', minHeight: '100vh', paddingTop: '64px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <h1
          style={{
            fontSize: '42px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          Simple, Transparent Pricing
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: '#9ca3af',
            marginBottom: '48px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto 48px',
          }}
        >
          Choose the plan that fits your practice. All plans include a 14-day free trial.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '64px',
          }}
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              style={{
                padding: '32px',
                background: plan.popular ? '#1a0d2e' : '#0d0d0d',
                borderRadius: '16px',
                border: plan.popular ? '2px solid #8b5cf6' : '1px solid #222',
                position: 'relative',
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '24px',
                    background: '#8b5cf6',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <h3
                style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}
              >
                {plan.name}
              </h3>
              <div style={{ marginBottom: '8px' }}>
                {plan.kPrice ? (
                  <>
                    <span style={{ fontSize: '36px', fontWeight: 700, color: '#8b5cf6' }}>
                      KES {plan.kPrice.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '16px', color: '#6b7280' }}> / {plan.period}</span>
                  </>
                ) : (
                  <span style={{ fontSize: '24px', fontWeight: 600, color: '#8b5cf6' }}>
                    Contact Us
                  </span>
                )}
              </div>
              <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>
                {plan.description}
              </p>

              <div style={{ marginBottom: '24px' }}>
                {plan.features.map((feature, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#8b5cf620',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="#8b5cf6" strokeWidth="2" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (plan.kPrice) {
                    // Start subscription flow
                    message.info(`Starting ${plan.name} subscription...`);
                    // Navigate to subscription setup or trigger API
                    navigate('/subscription/setup', { state: { plan } });
                  } else {
                    // Contact sales for enterprise
                    window.open(
                      'mailto:sales@wakiliworld.com?subject=Enterprise Plan Inquiry',
                      '_blank'
                    );
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: plan.popular ? '#8b5cf6' : 'transparent',
                  border: plan.popular ? 'none' : '1px solid #404040',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {plan.kPrice ? 'Start Free Trial' : 'Contact Sales'}
              </button>
            </div>
          ))}
        </div>

        <h2
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#ffffff',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Frequently Asked Questions
        </h2>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                background: '#0d0d0d',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #222',
              }}
            >
              <h4
                style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}
              >
                {faq.question}
              </h4>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
