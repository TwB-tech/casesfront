import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpOutlined } from '@ant-design/icons';

const SCROLL_BUTTON_THRESHOLD = 280;

const ScrollManager = () => {
  const location = useLocation();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      setShowButton(window.scrollY > SCROLL_BUTTON_THRESHOLD);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={scrollToTop}
      className={`scroll-to-top-btn ${showButton ? 'visible' : ''}`}
    >
      <ArrowUpOutlined />
    </button>
  );
};

export default ScrollManager;
