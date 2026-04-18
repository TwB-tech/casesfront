import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import womanImg from '../../assets/img/p1.png';

const Hero = () => {
  const { user } = useAuth();

  return (
    <section
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          maxWidth: '55%',
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <h1
            style={{
              fontSize: '52px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '24px',
            }}
          >
            The Modern Platform for <span style={{ color: '#8b5cf6' }}>Legal Professionals</span>
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: '#9ca3af',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}
          >
            Manage cases, clients, and documents in one place. Collaborate with your team and
            deliver better legal services with confidence.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
            {user ? (
              <Link
                to="/home"
                style={{
                  background: '#8b5cf6',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Continue to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  style={{
                    background: '#8b5cf6',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/firms"
                  style={{
                    background: 'transparent',
                    border: '1px solid #404040',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Find Law Firms
                </Link>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '48px' }}>
            {[
              { value: '500+', label: 'Law Firms' },
              { value: '50,000+', label: 'Cases Managed' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          maxWidth: '45%',
        }}
      >
        <img
          src={womanImg}
          alt="Legal Professional"
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
          }}
        />
      </div>
    </section>
  );
};

export default Hero;
