import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/authContext';
import { notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import LogoNoBg from '../../assets/LogoNoBg.png';

const inputClass =
  'w-full rounded-xl py-3 px-4 outline-none transition-colors duration-200';

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
    nationality: '',
    occupation: '',
    'date of birth': '',
    'id number or passport number': '',
    'marital status': '',
    service_consultation: false,
    service_document_review: false,
    service_contract_drafting: false,
    service_court_representation: false,
    service_legal_advice: false,
  });
  const { register } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { isFuturistic } = useTheme();
  const navigate = useNavigate();

  const bgColor = isFuturistic ? '#0a0a0f' : '#F2E0D6';
  const cardBg = isFuturistic ? '#0f0f18' : '#ffffff';
  const inputBg = isFuturistic ? '#1a1a24' : '#F9F5FF';
  const textColor = isFuturistic ? '#ffffff' : '#1f2937';
  const mutedText = isFuturistic ? '#94a3b8' : '#6b7280';
  const borderColor = isFuturistic ? '#4c1d95' : '#ddd6fe';
  const accent = isFuturistic ? '#7c3aed' : '#4c1d95';
  const accentHover = isFuturistic ? '#6d28d9' : '#5b21b6';

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
      if (!formData.email || formData.email.trim() === '') throw new Error('Email is required');
      if (!formData.password || formData.password.length < 6)
        throw new Error('Password must be at least 6 characters long');
      if (formData.password !== formData['confirm password']) throw new Error('Passwords do not match');

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
      style: {
        backgroundColor: inputBg,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
      },
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
          style={{
            backgroundColor: inputBg,
            color: textColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            resize: 'vertical',
          }}
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
          style={{
            backgroundColor: inputBg,
            color: textColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
          }}
          required
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
          style={{
            backgroundColor: inputBg,
            color: textColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
          }}
          required
        />
      );
    }

    const type = field.includes('password') ? 'password' : 'text';
    return <input type={type} {...common} required />;
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
          <p style={{ color: mutedText }}>Join WakiliWorld. Choose your account type to get started.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          {!isTypeSelected ? (
            <div className="space-y-8">
              {['Legal Professionals', 'Institutions', 'Other'].map((group) => (
                <div key={group}>
                  <p className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: mutedText }}>
                    {group}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {userTypeOptions
                      .filter((opt) => opt.group === group)
                      .map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setUserType(type.label)}
                          className="w-full rounded-xl px-5 py-4 text-left font-bold transition-colors"
                          style={{
                            backgroundColor: inputBg,
                            color: textColor,
                            border: `1px solid ${borderColor}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = accent;
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = inputBg;
                            e.currentTarget.style.color = textColor;
                          }}
                        >
                          {type.label}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
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
                  className="rounded-lg px-4 py-2 text-sm font-bold transition-colors"
                  style={{ color: textColor, backgroundColor: inputBg, border: `1px solid ${borderColor}` }}
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {visibleFields.map((field) => (
                  <div key={field} className={field === 'bio' || field === 'address' ? 'md:col-span-2' : ''}>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wide" style={{ color: textColor }}>
                      {field.replace(/_/g, ' ')}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: borderColor }}>
                <button
                  type="button"
                  onClick={() => setUserType('')}
                  className="rounded-lg px-6 py-3 font-bold transition-colors"
                  style={{ color: textColor, backgroundColor: inputBg, border: `1px solid ${borderColor}` }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg px-8 py-3 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: accent,
                    color: '#ffffff',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = accentHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = accent;
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
            <Link to="/login" className="font-bold" style={{ color: accent }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
