import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../../url';
import { Building2, Mail, Lock, User, Phone } from 'lucide-react';

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleData() {
  if (!name || !email || !password || !phone) {
    setError("All fields are required!");
    return;
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

  if (!phoneRegex.test(phone)) {
    setError("Invalid phone number! It should be a 10-digit Indian number.");
    return;
  }

  if (!emailRegex.test(email)) {
    setError("Invalid email format!");
    return;
  }

  if (!passwordRegex.test(password)) {
    setError("Password must be at least 6 characters long, contain uppercase, lowercase, number, and special character.");
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post(URL + "/api/auth/signup", {
      name,
      email,
      password,
      phone,
    });

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("loginstatus", "true");
      navigate("/");
    } else {
      setError("Signup failed: No token received.");
    }
  } catch (error) {
    setError(error.response?.data?.message || "Signup failed!");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] rounded-2xl shadow-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-center mb-8">
            <Building2 className="text-orange-500 w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-white text-center mb-8">Create Account</h2>
          
          <div className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                className="w-full bg-[#1a1a1a] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email"
                className="w-full bg-[#1a1a1a] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                type="tel"
                placeholder="Phone Number"
                className="w-full bg-[#1a1a1a] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
                className="w-full bg-[#1a1a1a] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-center text-sm">
                {error}
              </div>
            )}

            <button 
              onClick={handleData}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium 
                        hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-0.5 transition-all
                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="text-gray-400 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 hover:text-orange-400 font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;