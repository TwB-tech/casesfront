import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Clock,
  Star,
  CheckCircle2,
  Zap,
  Users,
  Scale,
  MessageSquare,
  Award,
  Building,
  Briefcase,
  MapPin,
} from 'lucide-react';
import { Button, Tabs, Spin, message } from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import api from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
/* eslint-disable no-console */

const FirmsMarketplace = () => {
  const { isFuturistic } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [firms, setFirms] = useState([]);

  // Fetch function defined before useEffect to avoid use-before-define
  const fetchFirms = async () => {
    try {
      setLoading(true);
      // Fetch all subscribed law firms from backend
      const response = await api.get('/firms');
      setFirms(response.data);
    } catch (error) {
      console.error('Error fetching firms:', error);
      message.error('Failed to load law firms. Please try again later.');
      setFirms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirms();
  }, []);

  const categories = [
    { key: 'all', label: 'All Practice Areas', icon: Briefcase, count: 42 },
    { key: 'corporate', label: 'Corporate Law', icon: Building, count: 15 },
    { key: 'litigation', label: 'Litigation', icon: Scale, count: 12 },
    { key: 'realestate', label: 'Real Estate', icon: MapPin, count: 8 },
    { key: 'ip', label: 'Intellectual Property', icon: Award, count: 5 },
    { key: 'family', label: 'Family Law', icon: Users, count: 4 },
  ];

  const services = [
    {
      title: 'Corporate Advisory',
      description:
        'Comprehensive corporate legal support including structuring, compliance, and governance',
      icon: Building,
      avgRate: '$120-250/hr',
    },
    {
      title: 'Litigation Services',
      description: 'Full representation in civil, commercial, and criminal litigation matters',
      icon: Scale,
      avgRate: '$150-300/hr',
    },
    {
      title: 'Real Estate Transactions',
      description: 'Conveyancing, property due diligence, and land dispute resolution',
      icon: MapPin,
      avgRate: '$100-180/hr',
    },
    {
      title: 'IP Protection',
      description: 'Trademark, patent, copyright registration and enforcement',
      icon: Award,
      avgRate: '$130-220/hr',
    },
    {
      title: 'Family Law Matters',
      description: 'Divorce, custody, adoption, and estate planning services',
      icon: Users,
      avgRate: '$80-150/hr',
    },
    {
      title: 'Commercial Arbitration',
      description: 'Alternative dispute resolution for commercial conflicts',
      icon: Briefcase,
      avgRate: '$180-350/hr',
    },
  ];

  const filteredFirms = firms.filter((firm) => {
    const matchesSearch =
      firm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firm.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      firm.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleContact = (firm) => {
    navigate(`/chat-users?hire=${firm.id}&type=firm`);
  };

  const tabItems = [
    {
      key: 'all',
      label: 'All Law Firms',
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFirms.map((firm) => (
            <FirmCard key={firm.id} firm={firm} onContact={() => handleContact(firm)} />
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
          {filteredFirms
            .filter((f) => f.availability.includes('Now'))
            .map((firm) => (
              <FirmCard key={firm.id} firm={firm} onContact={() => handleContact(firm)} />
            ))}
        </div>
      ),
    },
    {
      key: 'toprated',
      label: 'Top Rated',
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFirms
            .filter((f) => f.rating >= 4.8)
            .map((firm) => (
              <FirmCard key={firm.id} firm={firm} onContact={() => handleContact(firm)} />
            ))}
        </div>
      ),
    },
    {
      key: 'emergency',
      label: 'Emergency Support',
      children: (
        <div className="text-center py-12">
          <div
            className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
              isFuturistic ? 'bg-danger/20' : 'bg-danger-50'
            }`}
          >
            <Zap className={`w-10 h-10 ${isFuturistic ? 'text-danger' : 'text-danger-500'}`} />
          </div>
          <h3
            className={`text-2xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
          >
            Need Urgent Legal Help?
          </h3>
          <p
            className={`mb-6 max-w-md mx-auto ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}
          >
            Our emergency law firm network can have qualified legal representation assigned to your
            matter within 2 hours. Available 24/7 for urgent legal matters.
          </p>
          <Button
            type="primary"
            size="large"
            className={isFuturistic ? 'futuristic-btn' : ''}
            style={{
              background: isFuturistic ? '#6366f1' : undefined,
            }}
          >
            Request Emergency Support
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Breadcrumbs />

      {/* Hero Section */}
      <div
        className={`relative overflow-hidden rounded-2xl mb-8 p-8 md:p-12 ${
          isFuturistic
            ? 'bg-gradient-to-br from-cyber-surface via-cyber-bg to-cyber-card border border-cyber-border'
            : 'bg-gradient-to-br from-primary-50 to-white border border-primary-100'
        }`}
      >
        {isFuturistic && (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-aurora-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-aurora-secondary/10 rounded-full blur-3xl" />
          </>
        )}

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isFuturistic
                  ? 'bg-aurora-primary/20 text-aurora-primary border border-aurora-primary/30'
                  : 'bg-success-100 text-success-700'
              }`}
            >
              Verified Law Firms
            </div>
            <div className="flex items-center gap-1 text-sm text-success-600">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              {firms.filter((f) => f.availability.includes('Now')).length} Firms Available Now
            </div>
          </div>

          <h1
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              isFuturistic ? 'text-aurora-text' : 'text-primary-900'
            }`}
          >
            Law Firm Directory
          </h1>

          <p
            className={`text-lg mb-6 max-w-2xl ${
              isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
            }`}
          >
            Connect with verified, subscribed law firms ready to handle your legal matters. All
            firms are pre-vetted and automatically listed upon WakiliWorld subscription.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
            <div
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl ${
                isFuturistic
                  ? 'bg-cyber-bg border border-cyber-border focus-within:border-aurora-primary'
                  : 'bg-white border border-neutral-200 shadow-sm'
              }`}
            >
              <Search
                className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}
                size={20}
              />
              <input
                type="text"
                placeholder="Search by firm name, location, or practice area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${
                  isFuturistic
                    ? 'text-aurora-text placeholder:text-aurora-muted'
                    : 'text-neutral-800'
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
          { label: 'Verified Law Firms', value: '50+', icon: Building },
          { label: 'Cases Handled', value: '25,000+', icon: CheckCircle2 },
          { label: 'Average Rating', value: '4.8/5', icon: Star },
          { label: 'Response Time', value: '< 1 hour', icon: Clock },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-xl ${
              isFuturistic
                ? 'bg-cyber-card border border-cyber-border'
                : 'bg-white border border-neutral-200 shadow-sm'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                isFuturistic ? 'bg-aurora-primary/20' : 'bg-primary-50'
              }`}
            >
              <stat.icon
                className={isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}
                size={20}
              />
            </div>
            <div
              className={`text-2xl font-bold ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
            >
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
          <div
            className={`sticky top-24 p-6 rounded-xl ${
              isFuturistic
                ? 'bg-cyber-card border border-cyber-border'
                : 'bg-white border border-neutral-200 shadow-sm'
            }`}
          >
            <h3
              className={`font-semibold mb-4 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
            >
              Practice Areas
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
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isFuturistic ? 'bg-cyber-bg' : 'bg-neutral-100'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            <div
              className={`mt-6 pt-6 border-t ${isFuturistic ? 'border-cyber-border' : 'border-neutral-200'}`}
            >
              <h4
                className={`font-medium mb-3 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                Need Specialized Counsel?
              </h4>
              <p
                className={`text-sm mb-4 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
              >
                Describe your specific legal needs and we will match you with the right law firm.
              </p>
              <Button
                block
                className={isFuturistic ? 'futuristic-btn' : ''}
                style={{
                  background: isFuturistic ? '#6366f1' : undefined,
                }}
              >
                Post a Legal Request
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Law Firms */}
        <div className="lg:col-span-3">
          <Tabs
            items={tabItems}
            activeKey={
              activeTab === 'all' || !categories.find((c) => c.key === activeTab)
                ? 'all'
                : activeTab
            }
            onChange={setActiveTab}
            className={isFuturistic ? 'firms-tabs' : ''}
          />
        </div>
      </div>

      {/* Services Section */}
      <div
        className={`mt-12 p-8 rounded-2xl ${
          isFuturistic
            ? 'bg-cyber-surface border border-cyber-border'
            : 'bg-neutral-50 border border-neutral-200'
        }`}
      >
        <div className="text-center mb-8">
          <h2
            className={`text-2xl font-bold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
          >
            Legal Services Available
          </h2>
          <p className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>
            Expert legal representation across all practice areas
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
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  isFuturistic ? 'bg-aurora-primary/20' : 'bg-primary-50'
                }`}
              >
                <service.icon
                  className={isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}
                  size={24}
                />
              </div>
              <h3
                className={`font-semibold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                {service.title}
              </h3>
              <p
                className={`text-sm mb-4 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
              >
                {service.description}
              </p>
              <div
                className={`text-sm font-medium ${isFuturistic ? 'text-aurora-primary' : 'text-primary-600'}`}
              >
                {service.avgRate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div
        className={`mt-12 p-8 md:p-12 rounded-2xl text-center ${
          isFuturistic
            ? 'bg-gradient-to-r from-aurora-primary/20 to-aurora-secondary/20 border border-aurora-primary/30'
            : 'bg-gradient-to-r from-primary-800 to-primary-900 text-white'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Looking for Professional Legal Representation?
        </h2>
        <p
          className={`text-lg mb-8 max-w-2xl mx-auto ${
            isFuturistic ? 'text-aurora-muted' : 'text-white/80'
          }`}
        >
          Get instant access to verified, subscribed law firms. All firms are automatically listed
          upon WakiliWorld subscription.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            type="primary"
            size="large"
            className={isFuturistic ? 'futuristic-btn' : ''}
            style={{
              background: isFuturistic ? undefined : 'white',
              color: isFuturistic ? undefined : '#1890ff',
            }}
          >
            Find a Law Firm
          </Button>
          <Button
            size="large"
            ghost={!isFuturistic}
            className={isFuturistic ? 'border-aurora-primary text-aurora-primary' : ''}
          >
            List Your Firm
          </Button>
        </div>
      </div>
    </div>
  );
};

const FirmCard = ({ firm, onContact }) => {
  const { isFuturistic } = useTheme();

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all hover:-translate-y-1 ${
        isFuturistic
          ? 'bg-cyber-card border border-cyber-border hover:border-aurora-primary/50 hover:shadow-glow-sm'
          : 'bg-white border border-neutral-200 shadow-sm hover:shadow-lg'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
              isFuturistic
                ? 'bg-gradient-to-br from-aurora-primary to-aurora-secondary text-white'
                : 'bg-primary-100 text-primary-800'
            }`}
          >
            {firm.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={`font-semibold truncate ${isFuturistic ? 'text-aurora-text' : 'text-neutral-800'}`}
              >
                {firm.name}
              </h3>
              {firm.verified && <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
              <span
                className={`text-sm font-medium ${isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}`}
              >
                {firm.rating}
              </span>
              <span
                className={`text-sm ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}
              >
                ({firm.reviews} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <MapPin className="w-3 h-3 text-neutral-400" />
              <span className={isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}>
                {firm.location}
              </span>
            </div>
          </div>
        </div>

        <p
          className={`text-sm mb-4 line-clamp-2 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'}`}
        >
          {firm.bio}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {firm.specialties.slice(0, 3).map((specialty, idx) => (
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
          {firm.specialties.length > 3 && (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                isFuturistic ? 'bg-cyber-bg text-aurora-muted' : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              +{firm.specialties.length - 3} more
            </span>
          )}
        </div>

        <div
          className={`grid grid-cols-2 gap-3 mb-4 text-sm ${
            isFuturistic ? 'text-aurora-muted' : 'text-neutral-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={14} />
            <span>{firm.advocatesCount} advocates</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-success-500" />
            <span>{firm.completedProjects} cases</span>
          </div>
        </div>

        <div
          className={`flex items-center justify-between pt-4 border-t ${
            isFuturistic ? 'border-cyber-border' : 'border-neutral-200'
          }`}
        >
          <div>
            <div
              className={`text-lg font-bold ${isFuturistic ? 'text-aurora-primary' : 'text-primary-700'}`}
            >
              ${firm.hourlyRate}/hr
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse" />
              <span className={isFuturistic ? 'text-aurora-muted' : 'text-success-600'}>
                {firm.availability}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="small"
              icon={<MessageSquare size={14} />}
              className={isFuturistic ? 'border-cyber-border' : ''}
              onClick={onContact}
            >
              Contact
            </Button>
            <Button
              type="primary"
              size="small"
              className={isFuturistic ? 'futuristic-btn' : ''}
              style={{
                background: isFuturistic ? undefined : '#1890ff',
              }}
              onClick={onContact}
            >
              Retain
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirmsMarketplace;
