import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/authContext';
import { notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import LogoNoBg from '../../assets/LogoNoBg.png';

const inputClass =
  'shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline';

function SignUp() {
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    'confirm password': '',
    'full name': '',
    'phone number': '',
    address: '',
    bio: '',
    'practice areas': '',
    'services offered': '',
    'consultation availability': '',
    'organization name': '',
    'registration number': '',
    'law firm name': '',
    'institution name': '',
    'clinic name': '',
    'nationality': '',
    occupation: '',
    'date of birth': '',
    'id number or passport number': '',
    'marital status': '',
  });
  const { register } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { isFuturistic } = useTheme();
  const navigate = useNavigate();

  const bgColor = isFuturistic ? '#0a0a0f' : '#F2E0D6';
  const cardBg = isFuturistic ? '#1a1a24' : '#ebe9d8';
  const inputBg = isFuturistic ? '#12121a' : '#e0cfc8';
  const textColor = isFuturistic ? '#f8fafc' : '#1a1a1a';
  const mutedText = isFuturistic ? '#94a3b8' : '#6b7280';
  const borderColor = isFuturistic ? '#2a2a3a' : '#d1d5db';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const mapRoleToBackend = (displayName) => {
    const roleMap = {
      Advocate: 'advocate',
      'Law School': 'law_school',
      'Legal Clinic': 'legal_clinic',
      'Law Firm': 'firm',
      Individual: 'individual',
      Organization: 'organization',
    };
    return roleMap[displayName] || displayName.toLowerCase().replace(/\s+/g, '_');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email || formData.email.trim() === '') {
        throw new Error('Email is required');
      }

      if (!formData.password || formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (formData.password !== formData['confirm password']) {
        throw new Error('Passwords do not match');
      }

      const lower_userType = mapRoleToBackend(userType);
      await register(formData, lower_userType);
      setLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      notification.error({
        message: 'Registration Failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
      setLoading(false);
    }
  };

  const userTypeOptions = [
    { label: 'Advocate', group: 'Legal Professionals' },
    { label: 'Law Firm', group: 'Legal Professionals' },
    { label: 'Law School', group: 'Institutions' },
    { label: 'Legal Clinic', group: 'Institutions' },
    { label: 'Individual', group: 'Other' },
    { label: 'Organization', group: 'Other' },
  ];

  const renderField = (field) => {
    const common = {
      name: field,
      value: formData[field] || '',
      onChange: handleChange,
      placeholder: `Enter ${field.replace(/_/g, ' ')}`,
      className: inputClass,
      style: { backgroundColor: inputBg, color: textColor, borderColor, borderRadius: '8px' },
    };

    if (field === 'bio') {
      return (
        <textarea
          name={field}
          value={formData[field] || ''}
          onChange={handleChange}
          placeholder="Tell us about yourself or your organization..."
          rows={3}
          className={inputClass}
          style={{ backgroundColor: inputBg, color: textColor, borderColor, borderRadius: '8px', resize: 'vertical' }}
        />
      );
    }

    if (field === 'confirm password') {
      return (
        <input
          type="password"
          name={field}
          value={formData[field] || ''}
          onChange={handleChange}
          placeholder="Confirm your password"
          className={inputClass}
          style={{ backgroundColor: inputBg, color: textColor, borderColor, borderRadius: '8px' }}
        />
      );
    }

    if (field === 'password') {
      return (
        <input
          type="password"
          name={field}
          value={formData[field] || ''}
          onChange={handleChange}
          placeholder="Create a password"
          className={inputClass}
          style={{ backgroundColor: inputBg, color: textColor, borderColor, borderRadius: '8px' }}
        />
      );
    }

    if (field === 'services offered') {
      const accent = isFuturistic ? '#6366f1' : '#1A365D';
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
            Select the legal services you offer:
          </label>
          {[
            { key: 'consultation', label: 'Legal Consultation (30-60 min calls)' },
            { key: 'document_review', label: 'Document Review & Analysis' },
            { key: 'contract_drafting', label: 'Contract Drafting & Negotiation' },
            { key: 'court_representation', label: 'Court Representation' },
            { key: 'legal_advice', label: 'General Legal Advice' },
          ].map((service) => (
            <label key={service.key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                name={`service_${service.key}`}
                checked={formData[`service_${service.key}`] || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [`service_${service.key}`]: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 focus:ring-blue-500"
                style={{ accentColor: accent }}
              />
              <span style={{ color: textColor, fontSize: '14px' }}>{service.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field === 'consultation availability') {
      const accent = isFuturistic ? '#6366f1' : '#1A365D';
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
            When are you available for consultations?
          </label>
          {[
            { key: 'weekdays_9_5', label: 'Weekdays 9 AM - 5 PM' },
            { key: 'weekdays_evening', label: 'Weekdays Evening (5 PM - 8 PM)' },
            { key: 'weekends', label: 'Weekends' },
            { key: 'flexible', label: 'Flexible Schedule' },
          ].map((option) => (
            <label key={option.key} className="flex items-center space-x-3">
              <input
                type="radio"
                name="consultation_availability"
                value={option.key}
                checked={formData.consultation_availability === option.key}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    consultation_availability: option.key,
                  }))
                }
                className="border-gray-300 focus:ring-blue-500"
                style={{ accentColor: accent }}
              />
              <span style={{ color: textColor, fontSize: '14px' }}>{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    const type = field.includes('password') ? 'password' : 'text';
    return <input type={type} {...common} />;
  };

  const fieldsForRole = () => {
    if (!userType) return [];
    const map = {
      Advocate: [
        'full name',
        'email',
        'phone number',
        'practice areas',
        'bio',
        'password',
        'confirm password',
      ],
      'Law School': [
        'institution name',
        'email',
        'phone number',
        'address',
        'bio',
        'password',
        'confirm password',
      ],
      'Legal Clinic': [
        'clinic name',
        'email',
        'phone number',
        'address',
        'practice areas',
        'bio',
        'password',
        'confirm password',
      ],
      Individual: [
        'full name',
        'email',
        'phone number',
        'nationality',
        'occupation',
        'bio',
        'password',
        'confirm password',
      ],
      Organization: [
        'organization name',
        'registration number',
        'email',
        'phone number',
        'address',
        'bio',
        'password',
        'confirm password',
      ],
      'Law Firm': [
        'law firm name',
        'registration number',
        'email',
        'phone number',
        'address',
        'practice areas',
        'bio',
        'password',
        'confirm password',
      ],
    };
    return map[userType] || [];
  };

  const visibleFields = fieldsForRole();
  const isTypeSelected = Boolean(userType);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bgColor }}>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img
              src={LogoNoBg}
              alt="WakiliWorld Logo"
              style={{ maxHeight: '60px', maxWidth: '60px' }}
            />
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ color: textColor }}>
            Create your Account
          </h1>
          <p style={{ color: mutedText }}>
            Join WakiliWorld. Choose your account type to get started.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8"
          style={{
            backgroundColor: cardBg,
            border: isFuturistic ? `1px solid ${borderColor}` : '1px solid transparent',
          }}
        >
          {!isTypeSelected ? (
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold uppercase mb-3" style={{ color: mutedText }}>
                  Legal Professionals
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Advocate', 'Law Firm'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserType(type)}
                      className="w-full text-left px-5 py-4 rounded-xl transition-all font-bold shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: isFuturistic ? '#12121a' : '#ffffff',
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase mb-3" style={{ color: mutedText }}>
                  Institutions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Law School', 'Legal Clinic'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserType(type)}
                      className="w-full text-left px-5 py-4 rounded-xl transition-all font-bold shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: isFuturistic ? '#12121a' : '#ffffff',
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase mb-3" style={{ color: mutedText }}>
                  Other
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Individual', 'Organization'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserType(type)}
                      className="w-full text-left px-5 py-4 rounded-xl transition-all font-bold shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: isFuturistic ? '#12121a' : '#ffffff',
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight" style={{ color: textColor }}>
                  {userType} Registration
                </h2>
                <button
                  type="button"
                  onClick={() => setUserType('')}
                  className="text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                  style={{ color: textColor, backgroundColor: inputBg }}
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {visibleFields.map((field) => (
                  <div key={field} className={field === 'bio' || field === 'address' ? 'md:col-span-2' : ''}>
                    <label
                      className="block text-sm font-bold mb-2 uppercase tracking-wide"
                      style={{ color: textColor }}
                    >
                      {field.replace(/_/g, ' ')}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: borderColor }}>
                <button
                  type="button"
                  onClick={() => setUserType('')}
                  className="font-bold py-3 px-6 rounded-lg transition-colors"
                  style={{ color: textColor, backgroundColor: inputBg }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="font-bold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Submitting...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <p style={{ color: mutedText }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold" style={{ color: '#1A365D' }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
