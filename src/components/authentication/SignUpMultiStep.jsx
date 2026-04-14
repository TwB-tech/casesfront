import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/authContext';
import { Form, Input, Button, Typography, Checkbox, notification } from 'antd';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

function SignUpMultiStep() {
    const [userType, setUserType] = useState('');
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        'is auctioneer': false,
        'is disabled': false,
        'is advocate': false
    });
    const { register } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const { isFuturistic, themeConfig } = useTheme();

    const bgColor = isFuturistic ? themeConfig.background : '#F2E0D6';
    const cardBg = isFuturistic ? themeConfig.card : '#ebe9d8';
    const inputBg = isFuturistic ? themeConfig.inputBg : '#e0cfc8';
    const textColor = isFuturistic ? '#f8fafc' : '#1a1a1a';
    const mutedText = isFuturistic ? '#94a3b8' : '#6b7280';
    const borderColor = isFuturistic ? themeConfig.border : '#d1d5db';
    const accentColor = isFuturistic ? '#6366f1' : '#1A365D';

     const fields = {
         'Advocate': [
             ['full name', 'email', 'phone number', 'bar number'],
             ['practice areas', 'bio'],
             ['password', 'confirm password']
         ],
         'Law School': [
             ['institution name', 'email', 'phone number'],
             ['address', 'description'],
             ['password', 'confirm password']
         ],
         'Legal Clinic': [
             ['clinic name', 'email', 'phone number'],
             ['address', 'focus areas', 'bio'],
             ['password', 'confirm password']
         ],
         'Individual': [
             ['full name', 'email', 'phone number'],
             ['nationality', 'occupation', 'bio'],
             ['password', 'confirm password']
         ],
         'Organization': [
             ['Organization Name', 'registration number', 'email', 'phone number'],
             ['address', 'industry', 'bio'],
             ['password', 'confirm password'],
         ],
         'Law Firm': [
             ['Law Firm Name', 'registration number', 'email', 'phone number'],
             ['address', 'practice areas', 'bio'],
             ['password', 'confirm password'] 
         ],
     };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: type === 'checkbox' ? checked : value
        }));
      };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    
     const mapRoleToBackend = (displayName) => {
         const roleMap = {
             'Advocate': 'advocate',
             'Law School': 'law_school',
             'Legal Clinic': 'legal_clinic',
             'Law Firm': 'firm',
             'Individual': 'individual',
             'Organization': 'organization',
         };
         return roleMap[displayName] || displayName.toLowerCase().replace(/\s+/g, '_');
     };

    const handleUserTypeSelection = (type) => {
        setUserType(type);
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          if (formData.password !== formData['confirm password']) {
            notification.error({
              message: 'Password Mismatch',
              description: 'The passwords you entered do not match. Please try again.',
            });
            return;
          }
      
          const registrationData = {
            ...formData,
            role: mapRoleToBackend(userType),
          };
      
          const lower_userType = mapRoleToBackend(userType);
          await register(registrationData, lower_userType);
          
          notification.success({
            message: 'Registration Successful',
            description: 'Your account has been created successfully.',
          });
          setLoading(false);
          setStep(5);
        } catch (error) {
          notification.error({
            message: 'Registration Failed',
            description: error.response ? error.response.data.message : 'Something went wrong. Please try again.',
          });
          setLoading(false);
        }
      };

    const startOver = () => {
        setUserType('');
        setStep(0);
        setFormData({});
    };

    const renderUserTypeSelection = () => (
        <motion.div
            key="userType"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:w-3/5 mx-auto py-12"
        >
            <div className="text-center mb-8">
                <Link to="/" className="inline-block mb-4">
                    <img 
                        src={require('../../assets/LogoNoBg.png').default} 
                        alt='WakiliWorld Logo' 
                        style={{ maxHeight: '60px', maxWidth: '60px' }} 
                    />
                </Link>
                <h2 className="text-3xl font-bold mb-2" style={{ color: accentColor }}>
                    Join WakiliWorld
                </h2>
                <p style={{ color: mutedText }}>Select your account type to get started</p>
            </div>
            
             <div className="mb-6">
                 <p className="text-sm font-semibold uppercase mb-3" style={{ color: mutedText }}>
                     Legal Professionals
                 </p>
                 <div className="flex flex-col md:flex-row justify-center md:space-x-3 space-y-3 md:space-y-0">
                     {['Advocate', 'Law Firm'].map(type => (
                         <button
                             key={type}
                             onClick={() => handleUserTypeSelection(type)}
                             className={`font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg ${
                                 isFuturistic 
                                     ? 'futuristic-btn' 
                                     : 'bg-[#1A365D] hover:bg-[#2D3748] text-white'
                             }`}
                         >
                             {type}
                         </button>
                     ))}
                 </div>
             </div>
             
             <div className="mb-6">
                 <p className="text-sm font-semibold uppercase mb-3" style={{ color: mutedText }}>
                     Institutions
                 </p>
                 <div className="flex flex-col md:flex-row justify-center md:space-x-3 space-y-3 md:space-y-0">
                     {['Law School', 'Legal Clinic'].map(type => (
                         <button
                             key={type}
                             onClick={() => handleUserTypeSelection(type)}
                             className={`font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg ${
                                 isFuturistic 
                                     ? 'futuristic-btn-secondary' 
                                     : 'bg-[#38A169] hover:bg-[#2F855A] text-white'
                             }`}
                         >
                             {type}
                         </button>
                     ))}
                 </div>
             </div>
             
             <div className="mb-6">
                 <p className="text-sm font-semibold uppercase mb-3" style={{ color: mutedText }}>
                     Other
                 </p>
                 <div className="flex flex-col md:flex-row justify-center md:space-x-3 space-y-3 md:space-y-0">
                     {['Individual', 'Organization'].map(type => (
                         <button
                             key={type}
                             onClick={() => handleUserTypeSelection(type)}
                             className={`font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg ${
                                 isFuturistic 
                                     ? 'bg-cyber-surface text-aurora-text hover:bg-cyber-accent' 
                                     : 'bg-[#2D3748] hover:bg-[#1A365D] text-white'
                             }`}
                         >
                             {type}
                         </button>
                     ))}
                 </div>
             </div>
            
            <div className="mt-8 text-center">
                <p style={{ color: mutedText }}>
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold" style={{ color: accentColor }}>
                        Login
                    </Link>
                </p>
            </div>
        </motion.div>
    );

    const renderFormFields = () => {
        const currentFields = fields[userType][step - 1];
    
        return (
            <motion.div
                key={`${userType}-${step}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:w-3/5 mx-auto py-12 max-h-[80vh] overflow-y-auto"
            >
                <h2 className="text-2xl text-center mb-6 font-bold" style={{ color: textColor }}>
                    {userType} Registration - Step {step}/3
                </h2>
                 {currentFields.map(field => (
                     <div key={field} className="mb-4">
                         <label className="block text-sm font-bold mb-2" style={{ color: textColor }}>
                             {field.replace(/_/g, ' ').toUpperCase()}
                         </label>
                         {field === 'bio' || field === 'description' ? (
                             <textarea
                                 name={field}
                                 value={formData[field] || ''}
                                 onChange={handleChange}
                                 placeholder="Tell us about yourself or your organization..."
                                 rows={3}
                                 className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline"
                                 style={{ 
                                     backgroundColor: inputBg, 
                                     color: textColor,
                                     borderColor: borderColor,
                                     resize: 'vertical'
                                 }}
                             />
                         ) : field.includes('practice areas') || field.includes('focus areas') ? (
                             <textarea
                                 name={field}
                                 value={formData[field] || ''}
                                 onChange={handleChange}
                                 placeholder="List your practice areas, separated by commas..."
                                 rows={2}
                                 className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline"
                                 style={{ 
                                     backgroundColor: inputBg, 
                                     color: textColor,
                                     borderColor: borderColor
                                 }}
                             />
                         ) : (
                             <input
                                 type={field.includes('password') ? 'password' : 'text'}
                                 name={field}
                                 value={formData[field] || ''}
                                 onChange={handleChange}
                                 placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                                 className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline"
                                 style={{ 
                                     backgroundColor: inputBg, 
                                     color: textColor,
                                     borderColor: borderColor
                                 }}
                             />
                         )}
                     </div>
                 ))}

                <div className="flex justify-between mt-6">
                    {step === 1 ? (
                        <button 
                            onClick={startOver} 
                            className={`font-bold py-2 px-4 rounded ${
                                isFuturistic 
                                    ? 'bg-cyber-surface text-aurora-text' 
                                    : 'bg-gray-500 text-white'
                            }`}
                        >
                            Start Over
                        </button>
                    ) : (
                        <button 
                            onClick={prevStep} 
                            className={`font-bold py-2 px-4 rounded ${
                                isFuturistic 
                                    ? 'bg-cyber-surface text-aurora-text' 
                                    : 'bg-gray-500 text-white'
                            }`}
                        >
                            Back
                        </button>
                    )}
                    <button 
                        onClick={step < 3 ? nextStep : () => setStep(4)} 
                        className={`font-bold py-2 px-4 rounded ${
                            isFuturistic 
                                ? 'futuristic-btn' 
                                : 'bg-black text-white'
                        }`}
                    >
                        {step < 3 ? 'Next' : 'Review'}
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderSummary = () => {
        const allFields = fields[userType] ? fields[userType].flat() : [];
        const fieldsToDisplay = allFields.filter(field => !field.toLowerCase().includes('password'));
    
        return (
            <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="md:w-3/5 mx-auto py-12"
            >
                <h2 className="text-2xl text-center mb-6 font-bold" style={{ color: textColor }}>
                    Summary - {userType} Registration
                </h2>
                {fieldsToDisplay.map(field => (
                    <div key={field} className="mb-3" style={{ color: textColor }}>
                        <span className="font-bold">{field.toUpperCase()}: </span> 
                        {formData[field] !== undefined ? 
                            (['is auctioneer', 'is advocate', 'is disabled'].includes(field.toLowerCase()) ? 
                                (formData[field] ? 'Yes' : 'No') : 
                                formData[field].toString()) : 
                            'Not provided'}
                    </div>
                ))}
                <div className="flex justify-between mt-6">
                    <button 
                        onClick={prevStep} 
                        className={`font-bold py-2 px-4 rounded ${
                            isFuturistic 
                                ? 'bg-cyber-surface text-aurora-text' 
                                : 'bg-gray-500 text-white'
                        }`}
                    >
                        Edit
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className={`font-bold py-2 px-4 rounded ${
                            isFuturistic 
                                ? 'futuristic-btn' 
                                : 'bg-black text-white'
                        }`}
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderConfirmation = () => (
        <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:w-3/5 mx-auto py-12 text-center"
        >
            <div className="text-3xl mb-4 font-bold" style={{ color: textColor }}>
                Thank you for registering!
            </div>
            <div className="mb-8" style={{ color: mutedText }}>
                An email has been sent to your registered email account. Click on the link to verify your account.
            </div>
            <button 
                onClick={startOver} 
                className={`font-bold py-3 px-6 rounded ${
                    isFuturistic 
                        ? 'futuristic-btn' 
                        : 'bg-black text-white'
                }`}
            >
                Start Over
            </button>
        </motion.div>
    );

    return (
        <div 
            className="min-h-screen flex flex-col overflow-hidden" 
            style={{ backgroundColor: bgColor }}
        >
            <div className="container max-w-screen-xl mx-auto flex flex-col flex-grow w-full px-4 sm:px-6 md:px-8 py-8">
                <div className="flex-grow overflow-hidden">
                    <form 
                        onSubmit={(e) => e.preventDefault()} 
                        className={`md:w-4/5 mx-auto rounded-2xl p-8 ${isFuturistic ? 'futuristic-card' : ''}`}
                        style={{ 
                            backgroundColor: cardBg,
                            border: isFuturistic ? `1px solid ${borderColor}` : 'none'
                        }}
                    >
                        {step === 0 && renderUserTypeSelection()}
                        {step >= 1 && step <= 3 && renderFormFields()}
                        {step === 4 && renderSummary()}
                        {step === 5 && renderConfirmation()}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUpMultiStep;
