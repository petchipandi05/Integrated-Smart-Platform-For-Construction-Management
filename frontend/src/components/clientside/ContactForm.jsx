import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { URL } from '../../../url';

const ContactForm = ({ className = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNo: '',
    message: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const validatePhoneNo = (phoneNo) => {
    const phoneRegex = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phoneNo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhoneNo(formData.phoneNo)) {
      setErrorMessage('Please enter a valid phone number (e.g., 123-456-7890 or 1234567890)');
      return;
    }

    try {
      const response = await axios.post(URL+"/api/requestform", formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Form Submitted:', response.data);

      alert('Your request has been submitted successfully!');

      setFormData({
        name: '',
        email: '',
        phoneNo: '',
        message: '',
      });
      setErrorMessage('');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('There was an error submitting your request. Please try again.');
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content with padding to account for fixed header */}
      <div className="flex-grow pt-20"> {/* Adjusted to match the Header height */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-16 mb-16">
            {/* Left Section - Contact Info */}
            <div className="w-full lg:w-1/2 space-y-12">
              {/* Phone Number */}
              <div className="flex items-start">
                <div className="bg-orange-500 rounded-full p-4 mr-6 flex-shrink-0 w-16 h-16 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Phone number</h3>
                  <p className="text-lg">+91 9043382651</p>
                </div>
              </div>
              
              {/* Email Address */}
              <div className="flex items-start">
                <div className="bg-orange-500 rounded-full p-4 mr-6 flex-shrink-0 w-16 h-16 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Email address</h3>
                  <p className="text-lg">buildtrue@gmail.in</p>
                </div>
              </div>
              
              {/* Sales Office */}
              <div className="flex items-start">
                <div className="bg-orange-500 rounded-full p-4 mr-6 flex-shrink-0 w-16 h-16 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Buildtrue construction- Sales</h3>
                  <p className="text-lg">8-2-293/82/1/238, A/C, Road No 12,</p>
                  <p className="text-lg">MLA Colony, Banjara Hills, chennai, 600028.</p>
                </div>
              </div>
              
              {/* Operations Office */}
              <div className="flex items-start">
                <div className="bg-orange-500 rounded-full p-4 mr-6 flex-shrink-0 w-16 h-16 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Buildtrue  construction- Operations wing</h3>
                  <p className="text-lg">Ground floor, Magna lake view apartments,</p>
                  <p className="text-lg">Hitex road, chennai, 500084.</p>
                </div>
              </div>
            </div>
            
            {/* Right Section - Contact Form */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl font-bold mb-3">GET IN TOUCH</h2>
              <div className="w-20 h-1 bg-orange-500 mb-10"></div>
              
              {errorMessage && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">{errorMessage}</div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    className="w-full border border-gray-300 p-4 rounded-md"
                    onChange={handleChange}
                    placeholder="NAME"
                    required
                  />
                </div>
                
                <div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    className="w-full border border-gray-300 p-4 rounded-md"
                    onChange={handleChange}
                    placeholder="EMAIL"
                    required
                  />
                </div>
                
                <div>
                  <input
                    id="phoneNo"
                    name="phoneNo"
                    type="tel"
                    value={formData.phoneNo}
                    className="w-full border border-gray-300 p-4 rounded-md"
                    onChange={handleChange}
                    placeholder="PHONE NUMBER"
                    required
                  />
                </div>
                
                <div>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    className="w-full border border-gray-300 p-4 rounded-md"
                    onChange={handleChange}
                    placeholder="MESSAGE"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="px-12 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-md transition duration-300"
                  >
                    SUBMIT
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Full Width */}
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
};

export default ContactForm;