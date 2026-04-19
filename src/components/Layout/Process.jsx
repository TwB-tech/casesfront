import { Link } from 'react-router-dom';

const Process = () => {
  const features = [
    {
      title: 'Case Management',
      desc: 'Track case progress, manage deadlines, and organize all files in one secure location',
    },
    {
      title: 'Client Portal',
      desc: 'Give clients secure access to view case status, documents, and communicate with you',
    },
    {
      title: 'Document Automation',
      desc: 'Generate contracts, letters, and legal documents templates with AI assistance',
    },
    {
      title: 'Team Collaboration',
      desc: 'Assign tasks, track progress, and work together seamlessly across matters',
    },
  ];

  const benefits = [
    { title: 'Secure Storage', desc: 'Bank-grade encryption' },
    { title: 'Analytics', desc: 'Performance insights' },
    { title: 'Task Tracking', desc: 'Never miss deadlines' },
    { title: 'Calendar', desc: 'Smart scheduling' },
    { title: 'Video Calls', desc: 'Client meetings' },
  ];

  return (
    <section className="landing-process">
      <div className="landing-process__container">
        <div className="landing-process__header">
          <h2 className="landing-process__title">
            Everything You Need to Run Your Practice
          </h2>
          <p className="landing-process__subtitle">
            Powerful tools designed specifically for legal professionals
          </p>
        </div>

        <div className="landing-process__grid">
          {features.map((feature, index) => (
            <div key={index} className="landing-process__card">
              <h3 className="landing-process__card-title">{feature.title}</h3>
              <p className="landing-process__card-copy">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="landing-process__benefits">
          {benefits.map((benefit, index) => (
            <div key={index} className="landing-process__benefit">
              <div className="landing-process__benefit-dot" />
              <span>{benefit.title}</span>
            </div>
          ))}
        </div>

        <div className="landing-process__cta-wrap">
          <Link to="/signup" className="landing-process__cta">
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Process;
