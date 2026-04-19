import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import womanImg from '../../assets/img/p1.png';

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="landing-hero">
      <div className="landing-hero__content">
        <div className="landing-hero__copy">
          <h1 className="landing-hero__title">
            The Modern Platform for <span>Legal Professionals</span>
          </h1>

          <p className="landing-hero__subtitle">
            Manage cases, clients, and documents in one place. Collaborate with your team and
            deliver better legal services with confidence.
          </p>

          <div className="landing-hero__actions">
            {user ? (
              <Link to="/home" className="landing-hero__cta landing-hero__cta--primary">
                Continue to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="landing-hero__cta landing-hero__cta--primary">
                  Start Free Trial
                </Link>
                <Link to="/firms" className="landing-hero__cta landing-hero__cta--secondary">
                  Find Law Firms
                </Link>
              </>
            )}
          </div>

          <div className="landing-hero__stats">
            {[
              { value: '500+', label: 'Law Firms' },
              { value: '50,000+', label: 'Cases Managed' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index} className="landing-hero__stat">
                <div className="landing-hero__stat-value">{stat.value}</div>
                <div className="landing-hero__stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="landing-hero__visual">
        <img src={womanImg} alt="Legal Professional" className="landing-hero__image" />
      </div>
    </section>
  );
};

export default Hero;
