import React, { useState } from 'react';
import { 
  Search, Filter, Clock, Star, CheckCircle2, Zap, 
  Shield, Users, FileText, Calendar, Scale, DollarSign,
  ArrowRight, MessageSquare, ExternalLink, Award, AlertCircle
} from 'lucide-react';
import { Button, Rate, Tag, Badge, Tabs, Empty, Spin } from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';

const ParalegalsMarketplace = () => {
  const { isFuturistic, themeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const paralegals = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      avatar: 'SM',
      rating: 4.9,
      reviews: 127,
      specialties: ['Document Review', 'Legal Research', 'Contract Analysis'],
      hourlyRate: 45,
      availability: 'Available Now',
      verified: true,
      experience: '5 years',
      responseTime: '< 15 min',
      bio: 'Former Big Law paralegal specializing in commercial litigation and contract review. Bar-certified with expertise in legal research platforms.',
      completedProjects: 340,
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: 'MC',
      rating: 4.8,
      reviews: 98,
      specialties: ['Case Management', 'Trial Preparation', 'Client Communication'],
      hourlyRate: 55,
      availability: 'Available Today',
      verified: true,
      experience: '7 years',
      responseTime: '< 30 min',
      bio: 'Senior litigation paralegal with experience at top-tier law firms. Expert in trial preparation and case management systems.',
      completedProjects: 256,
    },
    {
      id: 3,
      name: 'Amanda Rodriguez',
      avatar: 'AR',
      rating: 4.9,
      reviews: 156,
      specialties: ['Corporate Law', 'M&A Due Diligence', 'Regulatory Compliance'],
      hourlyRate: 65,
      availability: 'Available Now',
      verified: true,
      experience: '8 years',
      responseTime: '< 1 hour',
      bio: 'Corporate transactions specialist with background at major law firms. Extensive experience in M&A due diligence and compliance review.',
      completedProjects: 412,
    },
    {
      id: 4,
      name: 'David Thompson',
      avatar: 'DT',
      rating: 4.7,
      reviews: 83,
      specialties: ['Real Estate', 'Title Research', 'Closing Documents'],
      hourlyRate: 50,
      availability: 'Available Today',
      verified: true,
      experience: '6 years',
      responseTime: '< 2 hours',
      bio: 'Real estate paralegal with expertise in title research, closing document preparation, and property due diligence.',
      completedProjects: 198,
    },
    {
      id: 5,
      name: 'Jennifer Walsh',
      avatar: 'JW',
      rating: 4.9,
      reviews: 112,
      specialties: ['Family Law', 'Divorce Proceedings', 'Child Custody'],
      hourlyRate: 48,
      availability: 'Available Now',
      verified: true,
      experience: '4 years',
      responseTime: '< 30 min',
      bio: 'Compassionate family law specialist with mediation training. Experienced in handling sensitive matters with discretion.',
      completedProjects: 289,
    },
    {
      id: 6,
      name: 'Robert Kim',
      avatar: 'RK',
      rating: 4.8,
      reviews: 91,
      specialties: ['Intellectual Property', 'Patent Filing', 'Trademark Research'],
      hourlyRate: 70,
      availability: 'Available Today',
      verified: true,
      experience: '9 years',
      responseTime: '< 1 hour',
      bio: 'IP specialist with USPTO experience. Expert in patent applications, trademark searches, and intellectual property litigation support.',
      completedProjects: 334,
    },
  ];

  const categories = [
    { key: 'all', label: 'All Services', icon: Users, count: 24 },
    { key: 'litigation', label: 'Litigation', icon: Scale, count: 8 },
    { key: 'corporate', label: 'Corporate', icon: FileText, count: 6 },
    { key: 'research', label: 'Research', icon: Search, count: 5 },
    { key: 'family', label: 'Family Law', icon: Users, count: 3 },
    { key: 'realestate', label: 'Real Estate', icon: Calendar, count: 4 },
  ];

  const services = [
    {
      title: 'Document Review',
      description: 'Thorough review and summarization of legal documents, contracts, and correspondence',
      icon: FileText,
      avgRate: '$35-55/hr',
    },
    {
      title: 'Legal Research',
      description: 'Comprehensive case law research, statutory analysis, and precedent identification',
      icon: Search,
      avgRate: '$40-60/hr',
    },
    {
      title: 'Trial Preparation',
      description: 'Exhibit preparation, witness coordination, and courtroom support materials',
      icon: Scale,
      avgRate: '$50-75/hr',
    },
    {
      title: 'Client Intake',
      description: 'Initial client interviews, information gathering, and case file establishment',
      icon: Users,
      avgRate: '$30-45/hr',
    },
    {
      title: 'Deadline Tracking',
      description: 'Calendar management, deadline monitoring, and reminder systems',
      icon: Clock,
      avgRate: '$25-40/hr',
    },
    {
      title: 'Document Drafting',
      description: 'Drafting legal documents, correspondence, and standard legal forms',
      icon: FileText,
      avgRate: '$45-70/hr',
    },
  ];

  const filteredParalegals = paralegals.filter(paralegal => {
    const matchesSearch = paralegal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paralegal.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleHire = (paralegal) => {
    window.location.href = `/chat-users?hire=${paralegal.id}`;
  };

  const tabItems = [
    {
      key: 'all',
      label: 'All Paralegals',
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParalegals.map(paralegal => (
            <ParalegalCard 
              key={paralegal.id} 
              paralegal={paralegal} 
              onHire={() => handleHire(paralegal)}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'available',
      label: (
        <span className="flex items-center gap-2">
          Available Now
          <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParalegals
            .filter(p => p.availability.includes('Now'))
            .map(paralegal => (
              <ParalegalCard 
                key={paralegal.id} 
                paralegal={paralegal} 
                onHire={() => handleHire(paralegal)}
              />
            ))}
        </div>
      ),
    },
    {
      key: 'toprated',
      label: 'Top Rated',
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParalegals
            .filter(p => p.rating >= 4.8)
            .map(paralegal => (
              <ParalegalCard 
                key={paralegal.id} 
                paralegal={paralegal} 
                onHire={() => handleHire(paralegal)}
              />
            ))}
        </div>
      ),
    },
    {
      key: 'emergency',
      label: 'Emergency Support',
      children: (
        <div className="text-center py-12">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
            isFuturistic ? 'bg-danger/20' : 'bg-danger-50'
          }`}>
            <Zap className={`w-10 h-10 ${isFuturistic ? 'text-danger' : 'text-danger-500'}`} />
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
            Need Urgent Help?
          </h3>
          <p className={`mb-6 max-w-md mx-auto ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
            Our emergency paralegal network can have qualified help assigned to your matter within 2 hours. 
            Available 24/7 for urgent matters.
          </p>
          <Button 
            type="primary" 
            size="large"
            className={isFuturistic ? 'futuristic-btn' : ''}
            style={{
              background: isFuturistic ? themeConfig.accent : undefined,
            }}
          >
            Request Emergency Support
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <Breadcrumbs />
      
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-2xl mb-8 p-8 md:p-12 ${
        isFuturistic 
          ? 'bg-gradient-to-br from-cyber-surface via-cyber-bg to-cyber-card border border-cyber-border' 
          : 'bg-gradient-to-br from-primary-50 to-white border border-primary-100'
      }`}>
        {isFuturistic && (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-aurora-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-aurora-secondary/10 rounded-full blur-3xl" />
          </>
        )}
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isFuturistic 
                ? 'bg-aurora-primary/20 text-aurora-primary border border-aurora-primary/30'
                : 'bg-success-100 text-success-700'
            }`}>
              On-Demand Support
            </div>
            <div className="flex items-center gap-1 text-sm text-success-600">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              12 Paralegals Available Now
            </div>
          </div>
          
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
            isFuturistic ? 'text-aurora-text' : 'text-primary-900'
          }`}>
            Paralegal Marketplace
          </h1>
          
          <p className={`text-lg mb-6 max-w-2xl ${
            isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
          }`}>
            Connect with pre-vetted, experienced paralegals ready to support your practice. 
            Scale your capacity instantly without long-term commitments.
          </p>
          
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
            <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl ${
              isFuturistic 
                ? 'bg-cyber-bg border border-cyber-border focus-within:border-aurora-primary'
                : 'bg-white border border-neutral-200 shadow-sm'
            }`}>
              <Search className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'} size={20} />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${
                  isFuturistic ? 'text-aurora-text placeholder:text-aurora-muted' : 'text-neutral-800'
                }`}
              />
            </div>
            <Button 
              size="large"
              icon={<Filter size={16} />}
              className={isFuturistic ? 'border-cyber-border' : ''}
            >
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Vetted Paralegals', value: '150+', icon: Shield },
          { label: 'Tasks Completed', value: '12,500+', icon: CheckCircle2 },
          { label: 'Average Rating', value: '4.9/5', icon: Star },
          { label: 'Response Time', value: '< 30 min', icon: Clock },
        ].map((stat, idx) => (
          <div 
            key={idx}
            className={`p-6 rounded-xl ${
              isFuturistic 
                ? 'bg-cyber-card border border-cyber-border' 
                : 'bg-white border border-neutral-200 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              isFuturistic ? 'bg-aurora-primary/20' : 'bg-primary-50'
            }`}>
              <stat.icon className={isFuturistic ? 'text-aurora-primary' : 'text-primary-600'} size={20} />
            </div>
            <div className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
              {stat.value}
            </div>
            <div className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <div className={`sticky top-24 p-6 rounded-xl ${
            isFuturistic 
              ? 'bg-cyber-card border border-cyber-border' 
              : 'bg-white border border-neutral-200 shadow-sm'
          }`}>
            <h3 className={`font-semibold mb-4 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    activeTab === cat.key
                      ? isFuturistic
                        ? 'bg-aurora-primary/20 text-aurora-primary border border-aurora-primary/30'
                        : 'bg-primary-50 text-primary-700 border border-primary-200'
                      : isFuturistic
                        ? 'text-aurora-muted hover:bg-cyber-hover'
                        : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                  onClick={() => setActiveTab(cat.key)}
                >
                  <div className="flex items-center gap-3">
                    <cat.icon size={18} />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isFuturistic ? 'bg-cyber-bg' : 'bg-neutral-100'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            <div className={`mt-6 pt-6 border-t ${isFuturistic ? 'border-cyber-border' : 'border-neutral-200'}`}>
              <h4 className={`font-medium mb-3 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
                Need Custom Support?
              </h4>
              <p className={`text-sm mb-4 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                Describe your specific needs and we will match you with the right paralegal.
              </p>
              <Button 
                block 
                className={isFuturistic ? 'futuristic-btn' : ''}
                style={{
                  background: isFuturistic ? themeConfig.accent : undefined,
                }}
              >
                Post a Request
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Paralegals */}
        <div className="lg:col-span-3">
          <Tabs 
            items={tabItems}
            activeKey={activeTab === 'all' ? 'all' : activeTab}
            onChange={setActiveTab}
            className={isFuturistic ? 'paralegals-tabs' : ''}
          />
        </div>
      </div>

      {/* Services Section */}
      <div className={`mt-12 p-8 rounded-2xl ${
        isFuturistic 
          ? 'bg-cyber-surface border border-cyber-border' 
          : 'bg-neutral-50 border border-neutral-200'
      }`}>
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
            Available Services
          </h2>
          <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>
            Expert support across all practice areas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <div 
              key={idx}
              className={`p-6 rounded-xl transition-all hover:-translate-y-1 ${
                isFuturistic 
                  ? 'bg-cyber-card border border-cyber-border hover:border-aurora-primary/50 hover:shadow-glow-sm' 
                  : 'bg-white border border-neutral-200 hover:shadow-lg hover:border-primary-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                isFuturistic ? 'bg-aurora-primary/20' : 'bg-primary-50'
              }`}>
                <service.icon className={isFuturistic ? 'text-aurora-primary' : 'text-primary-600'} size={24} />
              </div>
              <h3 className={`font-semibold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
                {service.title}
              </h3>
              <p className={`text-sm mb-4 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                {service.description}
              </p>
              <div className={`text-sm font-medium ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}>
                {service.avgRate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className={`mt-12 p-8 md:p-12 rounded-2xl text-center ${
        isFuturistic 
          ? 'bg-gradient-to-r from-aurora-primary/20 to-aurora-secondary/20 border border-aurora-primary/30' 
          : 'bg-gradient-to-r from-primary-800 to-primary-900 text-white'
      }`}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Scale Your Practice?
        </h2>
        <p className={`text-lg mb-8 max-w-2xl mx-auto ${
          isFuturistic ? 'text-aurora-muted' : 'text-white/80'
        }`}>
          Get instant access to vetted paralegals. No recruitment fees. No long-term contracts. 
          Only pay for the hours you need.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            type="primary" 
            size="large"
            className={isFuturistic ? 'futuristic-btn' : ''}
            style={{
              background: isFuturistic ? undefined : 'white',
              color: isFuturistic ? undefined : themeConfig.accent || '#1890ff',
            }}
          >
            Get Started Free
          </Button>
          <Button 
            size="large"
            ghost={!isFuturistic}
            className={isFuturistic ? 'border-aurora-primary text-aurora-primary' : ''}
          >
            Schedule Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

const ParalegalCard = ({ paralegal, onHire }) => {
  const { isFuturistic, themeConfig } = useTheme();

  return (
    <div className={`rounded-xl overflow-hidden transition-all hover:-translate-y-1 ${
      isFuturistic 
        ? 'bg-cyber-card border border-cyber-border hover:border-aurora-primary/50 hover:shadow-glow-sm' 
        : 'bg-white border border-neutral-200 shadow-sm hover:shadow-lg'
    }`}>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
            isFuturistic 
              ? 'bg-gradient-to-br from-aurora-primary to-aurora-secondary text-white'
              : 'bg-primary-100 text-primary-800'
          }`}>
            {paralegal.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold truncate ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}>
                {paralegal.name}
              </h3>
              {paralegal.verified && (
                <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
              <span className={`text-sm font-medium ${isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}`}>
                {paralegal.rating}
              </span>
              <span className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
                ({paralegal.reviews} reviews)
              </span>
            </div>
          </div>
        </div>

        <p className={`text-sm mb-4 line-clamp-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}>
          {paralegal.bio}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {paralegal.specialties.map((specialty, idx) => (
            <span 
              key={idx}
              className={`px-2 py-1 rounded text-xs font-medium ${
                isFuturistic 
                  ? 'bg-aurora-primary/10 text-aurora-primary'
                  : 'bg-primary-50 text-primary-700'
              }`}
            >
              {specialty}
            </span>
          ))}
        </div>

        <div className={`grid grid-cols-2 gap-3 mb-4 text-sm ${
          isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
        }`}>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{paralegal.experience}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-success-500" />
            <span>{paralegal.completedProjects} tasks</span>
          </div>
        </div>

        <div className={`flex items-center justify-between pt-4 border-t ${
          isFuturistic ? 'border-cyber-border' : 'border-neutral-200'
        }`}>
          <div>
            <div className={`text-lg font-bold ${isFuturistic ? 'text-aurora-primary' : 'text-primary-700'}`}>
              ${paralegal.hourlyRate}/hr
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse" />
              <span className={isFuturistic ? 'text-aurora-muted' : 'text-success-600'}>
                {paralegal.availability}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="small"
              icon={<MessageSquare size={14} />}
              className={isFuturistic ? 'border-cyber-border' : ''}
            >
              Message
            </Button>
            <Button 
              type="primary" 
              size="small"
              className={isFuturistic ? 'futuristic-btn' : ''}
              style={{
                background: isFuturistic ? undefined : themeConfig.accent,
              }}
              onClick={onHire}
            >
              Hire
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParalegalsMarketplace;
