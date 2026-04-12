import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/authContext';
import { Form, Input, Button, Typography, Checkbox, notification } from 'antd';

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


    const fields = {
        // Legal Professionals
        'Advocate': [
            ['full name', 'email', 'phone number', 'law practice name'],
            ['license number', 'year admitted', 'practice areas'],
            ['password', 'confirm password']
        ],
        'Paralegal': [
            ['full name', 'email', 'phone number', 'agency name'],
            ['certification number', 'specialization', 'years of experience'],
            ['password', 'confirm password']
        ],
        // Institutions
        'Law School': [
            ['institution name', 'email', 'phone number', 'address'],
            ['dean name', 'faculty size', 'student capacity'],
            ['password', 'confirm password']
        ],
        'Legal Clinic': [
            ['clinic name', 'email', 'phone number', 'address'],
            ['organization type', 'registration number', 'focus areas'],
            ['password', 'confirm password']
        ],
        'Paralegal Agency': [
            ['agency name', 'email', 'phone number', 'address'],
            ['registration number', 'number of paralegals', 'service areas'],
            ['password', 'confirm password']
        ],
        // Clients
        'Individual': [
            ['full name', 'email', 'id number or passport number', 'gender', 'nationality', 'date of birth', 'phone number', 'occupation', 'marital status', 'is disabled', 'is advocate'],
            ['alternative phone number', 'address'],
            ['password', 'confirm password']
        ],
        'Organization': [
            ['Organization Name', 'Company Registration Number', 'email', 'phone number', 'is auctioneer'],
            ['address', 'alternative phone number'],
            ['password', 'confirm password'],
        ],
        'Law Firm': [
            ['Law Firm Registration No', 'Law Firm Name', 'email', 'phone number'],
            ['address', 'alternative phone number'],
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
    
    // Map display names to backend role values
    const mapRoleToBackend = (displayName) => {
        const roleMap = {
            'Advocate': 'advocate',
            'Paralegal': 'paralegal',
            'Law School': 'law_school',
            'Legal Clinic': 'legal_clinic',
            'Paralegal Agency': 'paralegal_agency',
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
          // Check if passwords match
          if (formData.password !== formData['confirm password']) {
            notification.error({
              message: 'Password Mismatch',
              description: 'The passwords you entered do not match. Please try again.',
            });
            return;
          }
      
          // Prepare the registration data
          const registrationData = {
            ...formData,
            role: mapRoleToBackend(userType),
          };
      
          const lower_userType = mapRoleToBackend(userType);
          // Call the register function from your auth context
          await register(registrationData, lower_userType);
          
        //   If registration is successful, show success notification and move to confirmation step
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
        setFormData({});  // Reset form data
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
            <div className="text-3xl text-center mb-4 font-bold" style={{ color: '#1A365D' }}>Join WakiliHub</div>
            <p className="text-center text-gray-600 mb-8">Select your account type to get started</p>
            
            {/* Legal Professionals */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Legal Professionals</p>
                <div className="flex flex-col md:flex-row justify-center md:space-x-3 space-y-3 md:space-y-0">
                    {['Advocate', 'Paralegal'].map(type => (
                        <button
                            key={type}
                            onClick={() => handleUserTypeSelection(type)}
                            className="bg-[#1A365D] hover:bg-[#2D3748] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Institutions */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Institutions</p>
                <div className="flex flex-col md:flex-row justify-center md:space-x-3 space-y-3 md:space-y-0">
                    {['Law School', 'Legal Clinic', 'Paralegal Agency'].map(type => (
                        <button
                            key={type}
                            onClick={() => handleUserTypeSelection(type)}
                            className="bg-[#38A169] hover:bg-[#2F855A] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Other */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Other</p>
                <div className="flex flex-col md:flex-row justify-center md:space-x-3 space-y-3 md:space-y-0">
                    {['Individual', 'Organization', 'Law Firm'].map(type => (
                        <button
                            key={type}
                            onClick={() => handleUserTypeSelection(type)}
                            className="bg-[#2D3748] hover:bg-[#1A365D] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-gray-600">Already have an account? <a href="/login" className="font-bold text-[#1A365D] hover:text-[#38A169]">Login</a></p>
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
                <div className="text-3xl text-center mb-8">{userType} Registration - Step {step}/3</div>
                {currentFields.map(field => (
                    <div key={field} className="mb-4">
                        <label className="block text-sm font-bold mb-2">{field.toUpperCase()}</label>
                        {field === 'is auctioneer' || field === 'is disabled' || field === 'is advocate' ? (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name={field}
                                    checked={formData[field] || false}
                                    onChange={handleChange}
                                    className="form-checkbox h-5 w-5 text-black"
                                />
                            </div>
                        ) : field === 'gender' ? (
                            <div className="flex items-center">
                                <label className="mr-4 flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Male"
                                        checked={formData.gender === 'Male'}
                                        onChange={handleChange}
                                        className="form-radio h-5 w-5 text-black"
                                    />
                                    <span className="ml-2">Male</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Female"
                                        checked={formData.gender === 'Female'}
                                        onChange={handleChange}
                                        className="form-radio h-5 w-5 text-black"
                                    />
                                    <span className="ml-2">Female</span>
                                </label>
                            </div>
                        ): field === 'marital status' ? (
                            <div className="flex items-center">
                                <label className="mr-4 flex items-center">
                                    <input
                                        type="radio"
                                        name="marital status"
                                        value="Single"
                                        checked={formData['marital status'] === 'Single'}
                                        onChange={handleChange}
                                        className="form-radio h-5 w-5 text-black"
                                    />
                                    <span className="ml-2">Single</span>
                                </label>
                                <label className="mr-4 flex items-center">
                                    <input
                                        type="radio"
                                        name="marital status"
                                        value="Married"
                                        checked={formData['marital status'] === 'Married'}
                                        onChange={handleChange}
                                        className="form-radio h-5 w-5 text-black"
                                    />
                                    <span className="ml-2">Married</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="marital status"
                                        value="Divorced"
                                        checked={formData['marital status'] === 'Divorced'}
                                        onChange={handleChange}
                                        className="form-radio h-5 w-5 text-black"
                                    />
                                    <span className="ml-2">Divorced</span>
                                </label>
                            </div>
                        )
                        : (
                            <input
                                type={field === 'date of birth' ? 'date' : 
                                    field.includes('password') ? 'password' : 'text'}
                                name={field}
                                value={formData[field] || ''}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                style={{ backgroundColor: '#e0cfc8' }}
                            />
                        )}
                    </div>
                ))}

                <div className="flex justify-between mt-6">
                    {step === 1 ? (
                        <button onClick={startOver} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Start Over</button>
                    ) : (
                        <button onClick={prevStep} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Back</button>
                    )}
                    <button onClick={step < 3 ? nextStep : () => setStep(4)} className="bg-black text-white font-bold py-2 px-4 rounded">
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
                <div className="text-3xl text-center mb-8">Summary - {userType} Registration</div>
                {fieldsToDisplay.map(field => (
                    <div key={field} className="mb-4">
                        <span className="font-bold">{field.toUpperCase()}: </span> 
                        {formData[field] !== undefined ? 
                            (['is auctioneer', 'is advocate', 'is disabled'].includes(field.toLowerCase()) ? 
                                (formData[field] ? 'true' : 'false') : 
                                formData[field].toString()) : 
                            'Not provided'}
                    </div>
                ))}
                <div className="flex justify-between mt-6">
                    <button onClick={prevStep} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Edit</button>
                    <button onClick={handleSubmit} className="bg-black text-white font-bold py-2 px-4 rounded">{loading ? 'Submitting...' : 'Submit'}</button>
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
            <div className="text-3xl mb-4">Thank you for registering!</div>
            <div className="mb-8">An email has been sent to your registered email account. Click on the link to verify your account.</div>
            <button onClick={startOver} className="bg-black text-white font-bold py-2 px-4 rounded">
                Start Over
            </button>
        </motion.div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-[#F2E0D6] overflow-hidden">
            <div className="container max-w-screen-xl mx-auto flex flex-col flex-grow w-full px-4 sm:px-6 md:px-8 py-8">
                <div className="text-6xl font-bold whitespace-pre-line text-center tracking-tighter mb-12">
                    Sign Up Here
                </div>
                <div className="flex-grow overflow-hidden">
                    <form onSubmit={(e) => e.preventDefault()} className="md:w-4/5 mx-auto rounded-3xl p-8" style={{ backgroundColor: '#ebe9d8' }}>
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