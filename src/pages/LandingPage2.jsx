import { useEffect, useState } from 'react';
import '.././App.css';
import Aos from 'aos';
import 'aos/dist/aos.css'
// import Header from './components/Header/Header';
import NavBar from '../components/Layout/Navbar';
import Hero from '../components/Layout/Hero';
// import Features from './pages/Features';
import Process from '../components/Layout/Process';
// import Brands from "./pages/Brands";
import Start from '../components/Layout/Start';
// import Footer from '../components/Layout/Footer1';

// import Footer from './pages/Footer';
// import NavMobile from './components/nav/NavMobile';

function App() {
  // State management for navbar
  const [navMobile, setNavMobile] = useState(false);
  // initialize aos on render
  useEffect(() => {
    Aos.init({
      duration: 2500,
      delay: 400,
    });
  }
  );
  return (
    <div className='overflow-hidden' style={{marginBottom:"20px"}}>
      <div className='relative bg-hero-pattern bg-cover bg-center pb-12 md:pb-24' >
        <Hero />
        <div className={`${navMobile ? 'right-0' : '-right-full'} fixed z-10 top-0 h-full transition-all duration-200`}>
        </div>
      </div>
      <Process />
      
      {/* Paralegal Marketplace Section */}
      <section id="paralegals" className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm md:text-base font-semibold text-primary-600 tracking-wider mb-4">ON-DEMAND LEGAL SUPPORT</h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-6">Never Get Overwhelmed Again</h3>
            <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              When trial season hits, staff shortages strike, or you simply have too much on your plate — our vetted network of remote paralegals is ready to step in within hours.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-neutral-50 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-primary-900 mb-3">Emergency Support</h4>
              <p className="text-neutral-600">Get qualified help within 2 hours for urgent matters. Perfect for last-minute trial preparation or document review deadlines.</p>
            </div>
            
            <div className="bg-neutral-50 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-primary-900 mb-3">Fully Vetted</h4>
              <p className="text-neutral-600">Every paralegal undergoes rigorous background checks, skills verification, and has minimum 3 years of practical legal experience.</p>
            </div>
            
            <div className="bg-neutral-50 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-warning-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-primary-900 mb-3">No Commitments</h4>
              <p className="text-neutral-600">Pay only for the hours you need. No recruitment fees, no long-term contracts, no overhead. Scale up or down as your caseload changes.</p>
            </div>
          </div>
          
          <div className="text-center">
            <button className="py-4 px-10 bg-primary-800 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 text-lg">
              Browse Available Paralegals →
            </button>
          </div>
        </div>
      </section>
      
      <Start />
    </div >
  );
}

export default App;
