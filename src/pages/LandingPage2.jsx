import { useEffect, useState } from 'react';
import '.././App.css';
import Aos from 'aos';
import 'aos/dist/aos.css';
import Hero from '../components/Layout/Hero';
import Process from '../components/Layout/Process';
import { useTheme } from '../contexts/ThemeContext';
import {
  Shield,
  Zap,
  Users,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  FileText,
  Calendar,
  BarChart3,
  Bot,
} from 'lucide-react';

function LandingPage() {
  const [navMobile] = useState(false);
  const { isFuturistic } = useTheme();

  useEffect(() => {
    Aos.init({
      duration: 1000,
      delay: 200,
      once: true,
    });
  }, []);

  const features = [
    {
      icon: Bot,
      title: 'AI Legal Assistant',
      description:
        'Reya helps you draft documents, research cases, and manage tasks with intelligent automation.',
      color: 'primary',
    },
    {
      icon: FileText,
      title: 'Case Management',
      description:
        'Organize all your cases, clients, and documents in one secure, searchable platform.',
      color: 'accent',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Never miss a deadline with automated reminders and calendar integrations.',
      color: 'success',
    },
    {
      icon: Users,
      title: 'Law Firm Directory',
      description: 'Access verified, subscribed law firms on-demand for specialized legal support.',
      color: 'warning',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Get insights into your practice performance with real-time reporting.',
      color: 'primary',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and compliance to protect your sensitive data.',
      color: 'accent',
    },
  ];

  const stats = [
    { value: '500+', label: 'Law Firms' },
    { value: '50,000+', label: 'Cases Managed' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' },
  ];

  const testimonials = [
    {
      quote:
        'WakiliWorld has transformed how I manage my practice. I save over 20 hours per week on administrative tasks.',
      author: 'Sarah Mitchell',
      role: 'Partner, Mitchell & Associates',
      rating: 5,
    },
    {
      quote:
        'The AI assistant Reya is incredible. It helps me draft documents in minutes that used to take hours.',
      author: 'Michael Chen',
      role: 'Solo Practitioner',
      rating: 5,
    },
    {
      quote:
        'The law firm directory is a game-changer. I can find specialized legal support without hiring full-time staff.',
      author: 'Amanda Rodriguez',
      role: 'Managing Partner, Rodriguez Legal',
      rating: 5,
    },
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return isFuturistic
          ? 'bg-aurora-primary/20 text-aurora-primary'
          : 'bg-primary-100 text-primary-600';
      case 'accent':
        return isFuturistic
          ? 'bg-aurora-secondary/20 text-aurora-secondary'
          : 'bg-accent-100 text-accent-600';
      case 'success':
        return 'bg-success-100 text-success-600';
      case 'warning':
        return 'bg-warning-100 text-warning-600';
      default:
        return '';
    }
  };

  return (
    <div className={`overflow-hidden ${isFuturistic ? 'bg-cyber-bg' : 'bg-white'}`}>
      <div
        className={`relative pb-12 md:pb-24 ${
          isFuturistic
            ? 'bg-gradient-to-b from-cyber-bg via-surface-900 to-cyber-bg'
            : 'bg-gradient-to-b from-white via-neutral-50 to-white'
        }`}
      >
        <Hero />
        <div
          className={`${navMobile ? 'right-0' : '-right-full'} fixed z-10 top-0 h-full transition-all duration-200`}
        ></div>
      </div>
      <Process />

      {/* Features Section */}
      <section
        id="features"
        className={`py-20 px-4 md:px-8 ${
          isFuturistic ? 'bg-gradient-to-b from-cyber-bg to-surface-900' : 'bg-neutral-50'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-up">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                isFuturistic
                  ? 'bg-aurora-primary/10 border border-aurora-primary/30'
                  : 'bg-primary-50'
              }`}
            >
              <Zap
                className={`w-4 h-4 ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}
              />
              <span
                className={`text-sm font-medium ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}
              >
                POWERFUL FEATURES
              </span>
            </div>
            <h2
              className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${
                isFuturistic ? 'text-aurora-text' : 'text-primary-900'
              }`}
            >
              Everything You Need to
              <span className={isFuturistic ? 'gradient-text' : 'text-accent-500'}>
                {' '}
                Run Your Practice
              </span>
            </h2>
            <p
              className={`text-lg max-w-2xl mx-auto ${
                isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
              }`}
            >
              A complete platform designed specifically for legal professionals. Manage cases,
              clients, documents, and more with powerful AI assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                  isFuturistic
                    ? 'bg-cyber-card border border-cyber-border hover:border-aurora-primary/50 hover:shadow-glow-sm'
                    : 'bg-white hover:shadow-xl border border-neutral-200'
                }`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${getColorClasses(feature.color)}`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isFuturistic ? 'text-aurora-text' : 'text-primary-900'
                  }`}
                >
                  {feature.title}
                </h3>
                <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className={`py-16 px-4 md:px-8 ${
          isFuturistic
            ? 'bg-gradient-to-r from-aurora-primary/10 to-aurora-secondary/10'
            : 'bg-gradient-to-r from-primary-800 to-primary-900'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div
                  className={`text-4xl md:text-5xl font-bold mb-2 ${
                    isFuturistic ? 'text-aurora-primary' : 'text-white'
                  }`}
                >
                  {stat.value}
                </div>
                <div className={isFuturistic ? 'text-aurora-muted' : 'text-white/80'}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-20 px-4 md:px-8 ${isFuturistic ? 'bg-cyber-bg' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${
                isFuturistic ? 'text-aurora-text' : 'text-primary-900'
              }`}
            >
              Trusted by Legal Professionals
            </h2>
            <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}>
              See what lawyers are saying about WakiliWorld
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl ${
                  isFuturistic
                    ? 'bg-cyber-card border border-cyber-border'
                    : 'bg-neutral-50 border border-neutral-200'
                }`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning-500 fill-warning-500" />
                  ))}
                </div>
                <p
                  className={`text-lg mb-4 italic ${
                    isFuturistic ? 'text-aurora-muted' : 'text-neutral-700'
                  }`}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p
                    className={`font-semibold ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
                  >
                    {testimonial.author}
                  </p>
                  <p
                    className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Law Firms Section */}
      <section
        className={`py-20 px-4 md:px-8 ${isFuturistic ? 'bg-surface-900' : 'bg-neutral-50'}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                  isFuturistic ? 'bg-success/20 text-success' : 'bg-success-100 text-success-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Law Firm Directory</span>
              </div>
              <h2
                className={`text-3xl md:text-4xl font-bold mb-4 ${
                  isFuturistic ? 'text-aurora-text' : 'text-primary-900'
                }`}
              >
                Connect With Verified Law Firms
              </h2>
              <p
                className={`text-lg mb-6 ${
                  isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
                }`}
              >
                Access our directory of verified, subscribed law firms whenever you need specialized
                legal support. All firms are automatically listed upon WakiliWorld subscription. No
                recruitment fees. No long-term commitments.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Emergency support within 2 hours',
                  'Verified legal credentials',
                  'Background checked and vetted',
                  'Specialized by practice area',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2
                      className={`w-5 h-5 ${isFuturistic ? 'text-success' : 'text-success-500'}`}
                    />
                    <span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-700'}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="/firms"
                className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
                  isFuturistic
                    ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white shadow-aurora-primary/30 hover:shadow-aurora-primary/50'
                    : 'bg-primary-800 hover:bg-primary-700 text-white'
                }`}
              >
                Browse Law Firms
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="relative" data-aos="fade-left">
              <div
                className={`aspect-square rounded-2xl flex items-center justify-center ${
                  isFuturistic
                    ? 'bg-gradient-to-br from-aurora-primary/20 to-aurora-secondary/20 border border-aurora-primary/30'
                    : 'bg-gradient-to-br from-primary-100 to-accent-100'
                }`}
              >
                <Users
                  className={`w-32 h-32 ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}
                />
              </div>
              <div
                className={`absolute -bottom-4 -right-4 px-4 py-3 rounded-xl shadow-lg ${
                  isFuturistic ? 'bg-cyber-card border border-cyber-border' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock
                    className={`w-5 h-5 ${isFuturistic ? 'text-success' : 'text-success-500'}`}
                  />
                  <span
                    className={`font-medium ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
                  >
                    Avg Response: 1 hour
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        className={`py-20 px-4 md:px-8 ${
          isFuturistic
            ? 'bg-gradient-to-r from-aurora-primary/20 to-aurora-secondary/20'
            : 'bg-gradient-to-r from-accent-500 to-primary-700'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              isFuturistic ? 'text-aurora-text' : 'text-white'
            }`}
          >
            Ready to Transform Your Practice?
          </h2>
          <p
            className={`text-lg mb-8 max-w-2xl mx-auto ${
              isFuturistic ? 'text-aurora-muted' : 'text-white/90'
            }`}
          >
            Join hundreds of legal professionals who have saved time and grown their practice with
            WakiliWorld. Start your free 14-day trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 ${
                isFuturistic
                  ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white'
                  : 'bg-white text-primary-900 hover:bg-neutral-100'
              }`}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contact"
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all ${
                isFuturistic
                  ? 'border-2 border-cyber-border text-aurora-text hover:bg-cyber-hover'
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              Schedule Demo
            </a>
          </div>
          <p className={`mt-6 text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-white/70'}`}>
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-12 px-4 md:px-8 border-t ${
          isFuturistic ? 'bg-cyber-bg border-cyber-border' : 'bg-neutral-100 border-neutral-200'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4
                className={`font-semibold mb-4 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
              >
                Product
              </h4>
              <ul
                className={`space-y-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}
              >
                <li>
                  <a href="/#features" className="hover:underline">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="hover:underline">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/firms" className="hover:underline">
                    Law Firms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className={`font-semibold mb-4 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
              >
                Company
              </h4>
              <ul
                className={`space-y-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}
              >
                <li>
                  <a href="/about" className="hover:underline">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:underline">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className={`font-semibold mb-4 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
              >
                Resources
              </h4>
              <ul
                className={`space-y-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}
              >
                <li>
                  <a href="#" className="hover:underline">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className={`font-semibold mb-4 ${isFuturistic ? 'text-aurora-text' : 'text-primary-900'}`}
              >
                Legal
              </h4>
              <ul
                className={`space-y-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}
              >
                <li>
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div
            className={`pt-8 border-t text-center ${
              isFuturistic
                ? 'border-cyber-border text-aurora-muted'
                : 'border-neutral-200 text-neutral-500'
            }`}
          >
            <p>
              &copy; {new Date().getFullYear()} WakiliWorld. All rights reserved. Built by Tech with
              Brands.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
