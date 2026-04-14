import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import lawyer from "../../assets/img/Lawyer.png";
import ThemeSwitcher from "./ThemeSwitcher";

const Hero = () => {
    const { user } = useAuth();
    const { isFuturistic, themeConfig } = useTheme();

  return (
    <section className="relative overflow-hidden" data-aos="fade-up" data-aos-delay="1200">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-30 ${
          isFuturistic ? 'bg-aurora-primary' : 'bg-primary-200'
        }`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isFuturistic ? 'bg-aurora-secondary' : 'bg-accent-200'
        }`} />
        {isFuturistic && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-aurora-primary/10" />
        )}
      </div>

      <div className="relative max-w-screen-xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16 px-4 md:px-8 py-12 md:py-20">
        {/* Text Section */}
        <div className="flex-1 text-center md:text-left space-y-6 md:space-y-8">
          {isFuturistic && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aurora-primary/10 border border-aurora-primary/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-aurora-primary animate-pulse" />
              <span className="text-sm font-medium text-aurora-muted">New: AI-Powered Legal Assistant</span>
            </div>
          )}
          
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${
            isFuturistic ? 'text-aurora-text' : 'text-primary-900'
          }`}>
            {isFuturistic ? (
              <>
                <span className="gradient-text">Transform</span> Your Legal Practice
              </>
            ) : (
              <>
                Overwhelmed by paperwork, tight deadlines, and resource shortages?
              </>
            )}
          </h2>
          
          <p className={`text-base sm:text-lg md:text-xl leading-relaxed max-w-xl ${
            isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
          }`}>
            {isFuturistic 
              ? "Step into the future of legal practice management. Experience AI-powered automation, seamless collaboration, and intelligent insights that elevate your firm to new heights."
              : "You shouldn't have to choose between growing your practice and maintaining work-life balance. WakiliWorld eliminates the bottlenecks that hold legal professionals back:"
            }
          </p>
          
          <div className="space-y-4">
            {[
               { title: "End burnout cycles", desc: "Get instant access to verified law firms and advocates when caseloads spike" },
              { title: "Cut admin time by 60%", desc: "AI-powered case management that handles documentation automatically" },
              { title: "Never miss a deadline", desc: "Your AI assistant Reya monitors cases 24/7 and proactively alerts you" }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isFuturistic 
                    ? 'bg-gradient-to-br from-aurora-primary to-aurora-secondary' 
                    : 'bg-success-100'
                }`}>
                  <svg className={`w-4 h-4 ${isFuturistic ? 'text-white' : 'text-success-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className={isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}>
                    <strong className={isFuturistic ? 'text-aurora-primary' : 'text-primary-800'}>{item.title}</strong>
                    <span className={isFuturistic ? 'text-aurora-muted' : ''}> - {item.desc}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {user ? (
            <a
              href="/home"
              className={`inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 hover:-translate-y-1 ${
                isFuturistic
                  ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white shadow-aurora-primary/30 hover:shadow-aurora-primary/50'
                  : 'bg-primary-800 hover:bg-primary-700 text-white'
              }`}
            >
              <span>Hello {user.username}, Continue to Dashboard</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
              </svg>
            </a>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-8">
              <a
                href="/login"
                className={`w-full sm:w-auto py-4 px-8 text-center font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 ${
                  isFuturistic
                    ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white shadow-aurora-primary/30 hover:shadow-aurora-primary/50'
                    : 'bg-primary-800 hover:bg-primary-700 text-white'
                }`}
              >
                Free 14-Day Trial - No Credit Card Required
              </a>
               <a
                 href="/firms"
                 className={`w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-8 font-semibold rounded-xl transition-all ${
                   isFuturistic
                     ? 'border border-cyber-border text-aurora-text hover:bg-cyber-hover'
                     : 'border-2 border-primary-200 text-primary-800 hover:border-primary-300 hover:bg-primary-50'
                 }`}
               >
                 Find a Law Firm
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                 </svg>
               </a>
            </div>
          )}

          {/* Theme Switcher for Landing */}
          <div className="flex justify-center md:justify-start mt-8">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Image Section */}
        <div className="flex-1 relative">
          {isFuturistic && (
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-primary/20 to-aurora-secondary/20 rounded-3xl blur-2xl" />
          )}
          <div className={`relative rounded-2xl overflow-hidden ${
            isFuturistic 
              ? 'shadow-2xl shadow-aurora-primary/20 border border-cyber-border' 
              : 'shadow-xl'
          }`}>
            <img
              src={lawyer}
              alt="Legal professional"
              className="w-full h-auto max-w-sm md:max-w-md lg:max-w-lg mx-auto rounded-lg object-cover"
              draggable={false}
            />
            {isFuturistic && (
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-bg/80 to-transparent" />
            )}
          </div>
          
          {/* Floating badge */}
          <div className={`absolute -bottom-4 -right-4 px-4 py-2 rounded-xl shadow-lg ${
            isFuturistic
              ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white'
              : 'bg-white text-primary-800'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="font-semibold text-sm">500+ Law Firms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
