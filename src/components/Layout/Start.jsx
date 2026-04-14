import Button from "../Button/Button";
import computer from "../../assets/img/Programing.png";
import FootVector from "../../assets/img/Vector.png";
import { useTheme } from "../../contexts/ThemeContext";

const Start = () => {
  const { isFuturistic } = useTheme();
  
  return (
    <div className={`min-h-[90vh] w-full mb-0 relative overflow-hidden ${
      isFuturistic 
        ? 'bg-gradient-to-br from-cyber-bg via-surface-900 to-cyber-surface' 
        : 'bg-gradient-to-l from-accent-500 to-primary-700'
    }`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-30 ${
          isFuturistic ? 'bg-aurora-primary' : 'bg-accent-300'
        }`} />
        <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isFuturistic ? 'bg-aurora-secondary' : 'bg-primary-300'
        }`} />
        {isFuturistic && (
          <>
            <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full border border-aurora-primary/10" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full border border-aurora-secondary/10" />
          </>
        )}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-40 py-8 lg:py-[8rem] px-4 md:px-8 lg:px-16">
        {/* Text Content */}
        <div
          className="text-start"
          data-aos="fade-right"
          data-aos-delay="400"
          data-aos-duration="2000"
        >
          <div className={`mb-4 text-sm md:text-base lg:text-lg font-semibold tracking-wider ${
            isFuturistic ? 'text-aurora-muted' : 'text-white/80'
          }`}>
            READY TO TRANSFORM YOUR PRACTICE?
          </div>
          
          <h1 className={`text-[1.5rem] md:text-[2.5rem] lg:text-[3rem] font-bold mb-4 ${
            isFuturistic ? 'text-aurora-text' : 'text-white'
          }`}>
            Scale Your Capacity
            <br className="hidden lg:inline" /> 
            <span className={isFuturistic ? 'gradient-text' : 'text-accent-200'}>
              Without The Headache
            </span>
          </h1>
          
          <p className={`mb-6 lg:mb-8 text-xs md:text-sm lg:text-lg max-w-xl ${
            isFuturistic ? 'text-aurora-muted' : 'text-white/90'
          }`}>
             <strong className={isFuturistic ? 'text-aurora-text' : 'text-white'}>
               Access verified, subscribed law firms
             </strong> on-demand. No recruitment fees. No long-term commitments. 
             Just qualified legal support when you need it, integrated seamlessly with your existing case management workflow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/signup"
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 hover:-translate-y-1 ${
                isFuturistic
                  ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white shadow-aurora-primary/30 hover:shadow-aurora-primary/50'
                  : 'bg-white text-primary-900 hover:bg-neutral-100'
              }`}
            >
              Get Started Free
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
              </svg>
            </a>
             <a
               href="/firms"
               className={`inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all ${
                 isFuturistic
                   ? 'border border-cyber-border text-aurora-text hover:bg-cyber-hover hover:border-aurora-primary/50'
                   : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
               }`}
             >
               Browse Available Law Firms
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
               </svg>
             </a>
          </div>
          
          {/* Trust indicators */}
          <div className={`flex items-center gap-6 mt-8 text-sm ${
            isFuturistic ? 'text-aurora-muted' : 'text-white/70'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full" />
              <span>500+ Law Firms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div
          className="relative -mt-6 lg:mt-0 z-10"
          data-aos="fade-left"
          data-aos-delay="400"
          data-aos-duration="2000"
        >
          {isFuturistic && (
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-primary/20 to-aurora-secondary/20 rounded-3xl blur-2xl" />
          )}
          <div className={`relative ${
            isFuturistic 
              ? 'drop-shadow-2xl shadow-aurora-primary/20' 
              : ''
          }`}>
            <img
              src={computer}
              alt="WakiliWorld Platform"
              className="w-64 md:w-80 lg:w-96 z-30 relative"
            />
          </div>
          <img
            src={FootVector}
            alt="Vector illustration"
            className={`absolute -top-10 right-0 w-32 md:w-40 lg:w-48 z-10 opacity-50 ${
              isFuturistic ? 'hidden' : ''
            }`}
          />
          
          {/* Floating card */}
          <div className={`absolute -bottom-4 -left-4 px-4 py-3 rounded-xl shadow-lg ${
            isFuturistic
              ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white'
              : 'bg-white text-primary-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-xs opacity-80">Avg Response Time</div>
                <div className="font-bold">Less than 30 min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;
