import ProcessCard from "../Cards/ProcessCards.jsx";
import Line from "../../assets/img/Line.png";
import { ProcessInfo } from "../../data.js";
import V1 from "../../assets/img/V1.png";
import V2 from "../../assets/img/V2.png";
import V3 from "../../assets/img/V3.png";
import V4 from "../../assets/img/V4.png";
import V5 from "../../assets/img/V5.png";
import { useTheme } from "../../contexts/ThemeContext";
import { Scale, Calendar, FileText, Users, BarChart3, Clock, Shield, Zap } from 'lucide-react';

const Process = () => {
  const { isFuturistic } = useTheme();

  const features = [
    {
      icon: Scale,
      title: 'Case & Client Management',
      description: 'Track case progress, manage client relationships, and organize all case files in one secure location.',
      color: 'primary',
    },
    {
      icon: Clock,
      title: 'Task & Deadline Tracking',
      description: 'Never miss a deadline with automated reminders, task assignment, and progress monitoring.',
      color: 'accent',
    },
    {
      icon: BarChart3,
      title: 'Reporting & Analytics',
      description: 'Generate comprehensive reports on case status, billing, and firm performance with one click.',
      color: 'success',
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Upload, organize, and share legal documents securely with version control and access tracking.',
      color: 'warning',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team, assign tasks, and track progress across all matters.',
      color: 'primary',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and compliance features to protect your sensitive client data.',
      color: 'success',
    },
  ];

  return (
    <div className={`mt-12 lg:mt-0 relative overflow-hidden ${
      isFuturistic 
        ? 'bg-gradient-to-b from-cyber-bg via-surface-900 to-cyber-bg' 
        : 'bg-gradient-to-r from-primary-600 to-accent-600'
    }`}>
      {/* Decorative Images - Desktop only */}
      <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <img src={V2} alt="decor" className="absolute top-0 left-0 w-32 z-10" draggable={false} />
        <img src={V1} alt="decor" className="absolute -right-5 top-[60vh] scale-75 z-10" draggable={false} />
        <img src={V3} alt="decor" className="absolute right-0 top-[30vh] w-40 z-10" draggable={false} />
        <img src={V4} alt="decor" className="absolute top-[90vh] left-10 w-36 z-10" draggable={false} />
        <img src={V5} alt="decor" className="absolute top-[85vh] lg:top-[75vh] lg:right-[30vw] w-28 z-10" draggable={false} />
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isFuturistic ? 'bg-aurora-primary' : 'bg-white'
        }`} />
        <div className={`absolute bottom-20 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-15 ${
          isFuturistic ? 'bg-aurora-secondary' : 'bg-accent-300'
        }`} />
      </div>

      {/* Content Section */}
      <div className="relative z-20 py-12 px-6 lg:py-24 text-center">
        <div className={`text-sm lg:text-base font-semibold tracking-wider mb-3 ${
          isFuturistic ? 'text-aurora-muted' : 'text-white/70'
        }`}>
          HOW WE ELIMINATE YOUR BOTTLENECKS
        </div>
        
        <h1 className={`text-2xl sm:text-3xl lg:text-5xl font-bold mb-6 ${
          isFuturistic ? 'text-aurora-text' : 'text-white'
        }`}>
          {isFuturistic ? (
            <>
              <span className="gradient-text">Powerful Tools</span> for Modern Legal Practice
            </>
          ) : (
            'Legal Support When You Need It Most'
          )}
        </h1>
        
        <p className={`leading-normal sm:leading-relaxed mb-8 max-w-2xl mx-auto text-base md:text-lg ${
          isFuturistic ? 'text-aurora-muted' : 'text-white/90'
        }`}>
          {isFuturistic 
            ? 'Experience the future of legal practice management with AI-powered automation, seamless collaboration, and intelligent insights that elevate your firm to new heights.'
            : "Whether you are drowning in paperwork during trial season, facing unexpected staff shortages, or simply need to scale without hiring full-time employees — WakiliWorld adapts to your needs in real-time."
          }
        </p>

        {/* Features Grid */}
        <div className="relative z-20 w-full px-4">
          {/* Line Decoration */}
          <img
            src={Line}
            alt="line"
            className="absolute left-1/2 transform -translate-x-1/2 w-1/2 sm:w-2/3 lg:w-1/3 h-auto"
            data-aos="fade-down"
            data-aos-delay="400"
            data-aos-duration="2000"
          />

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                  isFuturistic
                    ? 'bg-cyber-card/50 backdrop-blur-sm border border-cyber-border hover:border-aurora-primary/50 hover:shadow-glow-sm'
                    : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                }`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === 'primary' 
                    ? (isFuturistic ? 'bg-aurora-primary/20' : 'bg-white/20')
                    : feature.color === 'accent'
                      ? (isFuturistic ? 'bg-aurora-secondary/20' : 'bg-accent-400/20')
                      : feature.color === 'success'
                        ? (isFuturistic ? 'bg-success/20' : 'bg-success-400/20')
                        : (isFuturistic ? 'bg-warning/20' : 'bg-warning-400/20')
                }`}>
                  <feature.icon className={`w-7 h-7 ${
                    feature.color === 'primary' 
                      ? (isFuturistic ? 'text-aurora-primary' : 'text-white')
                      : feature.color === 'accent'
                        ? (isFuturistic ? 'text-aurora-secondary' : 'text-white')
                        : feature.color === 'success'
                          ? (isFuturistic ? 'text-success' : 'text-white')
                          : (isFuturistic ? 'text-warning' : 'text-white')
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  isFuturistic ? 'text-aurora-text' : 'text-white'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${
                  isFuturistic ? 'text-aurora-muted' : 'text-white/80'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Process Cards (Original) */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 max-w-screen-lg mx-auto">
            {ProcessInfo.map((item, index) => (
              <ProcessCard
                key={index}
                image={item.image}
                icon={item.icon}
                heading={item.heading}
                description={item.description}
                color={item.color}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12">
            <a
              href="/signup"
              className={`inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 ${
                isFuturistic
                  ? 'bg-gradient-to-r from-aurora-primary to-aurora-secondary text-white shadow-aurora-primary/30 hover:shadow-aurora-primary/50'
                  : 'bg-white text-primary-900 hover:bg-neutral-100'
              }`}
            >
              Start Your Free Trial
              <Zap className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Process;
