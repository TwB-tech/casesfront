import { Link } from 'react-router-dom';
import Hero from '../components/Layout/Hero';
import Process from '../components/Layout/Process';
import { Star } from 'lucide-react';
import './landing.css';

function LandingPage() {
  const testimonials = [
    {
      quote:
        'WakiliWorld has transformed how I manage my practice. The case tracking and client portal features are exceptional.',
      author: 'Stellah Atieno',
      role: 'Partner, Atieno & Associates',
      rating: 5,
    },
    {
      quote:
        'The platform saved me over 20 hours per week on administrative tasks. The AI assistant Reya is incredibly helpful.',
      author: 'Kevin Mwangi',
      role: 'Solo Practitioner',
      rating: 5,
    },
    {
      quote:
        'Best legal practice management solution in Kenya. Our firm productivity has increased significantly.',
      author: 'Elvis Mwangi',
      role: 'Managing Partner',
      rating: 5,
    },
  ];

  return (
    <div className="landing-page">
      <Hero />
      <Process />

      <section className="landing-testimonials">
        <div className="landing-testimonials__container">
          <div className="landing-testimonials__header">
            <h2>Trusted by Legal Professionals</h2>
          </div>

          <div className="landing-testimonials__grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="landing-testimonials__card">
                <div className="landing-testimonials__stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#8b5cf6" color="#8b5cf6" />
                  ))}
                </div>
                <p className="landing-testimonials__quote">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="landing-testimonials__author">
                  <p>{testimonial.author}</p>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta__container">
          <h2>
            Ready to Transform Your Practice?
          </h2>
          <p>
            Join thousands of legal professionals already using WakiliWorld
          </p>
          <div className="landing-cta__actions">
            <Link to="/signup" className="landing-cta__button landing-cta__button--primary">
              Get Started Free
            </Link>
            <Link to="/contact" className="landing-cta__button landing-cta__button--secondary">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer__container">
          <div className="landing-footer__brand">
            <span>Wakili</span>
            <span>World</span>
          </div>
          <div className="landing-footer__links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="landing-footer__copyright">
            &copy; {new Date().getFullYear()} WakiliWorld. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
