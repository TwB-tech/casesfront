import { Link } from 'react-router-dom';
import Hero from '../components/Layout/Hero';
import Process from '../components/Layout/Process';
import { Star } from 'lucide-react';

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
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      <Hero />
      <Process />

      <section style={{ background: '#0d0d0d', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff' }}>
              Trusted by Legal Professionals
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                style={{
                  background: '#1a1a2e',
                  borderRadius: '12px',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#8b5cf6" color="#8b5cf6" />
                  ))}
                </div>
                <p
                  style={{
                    color: '#d1d5db',
                    marginBottom: '16px',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}
                >
                  &quot;{testimonial.quote}&quot;
                </p>
                <div>
                  <p style={{ color: '#ffffff', fontWeight: 600 }}>{testimonial.author}</p>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#000000', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
            Ready to Transform Your Practice?
          </h2>
          <p style={{ color: '#9ca3af', marginBottom: '32px' }}>
            Join thousands of legal professionals already using WakiliWorld
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link
              to="/signup"
              style={{
                background: '#8b5cf6',
                color: '#ffffff',
                padding: '14px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Get Started Free
            </Link>
            <Link
              to="/contact"
              style={{
                background: 'transparent',
                border: '1px solid #404040',
                color: '#ffffff',
                padding: '14px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: '#0d0d0d', padding: '32px 24px', borderTop: '1px solid #222' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '16px' }}>Wakili</span>
            <span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '16px' }}>World</span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link
              to="/privacy"
              style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}
            >
              Terms
            </Link>
            <Link
              to="/contact"
              style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}
            >
              Contact
            </Link>
          </div>
          <div style={{ color: '#4b5563', fontSize: '14px' }}>
            &copy; {new Date().getFullYear()} WakiliWorld. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
