
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../../url';
import { Building2, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const url=import.meta.env.VITE_URL

  async function handleData() {
    if (!email || !password) {
      setError("All fields are required!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(URL+"/api/auth/login", { email, password });
      if (res.data.token) {
        const user = res.data.user; // Use the full user object from backend response
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(user)); // Store full user object including role
        localStorage.setItem("loginstatus", "true");

        // Redirect based on role
        if (user.role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/"); // Default to client dashboard or home
        }
      } else {
        setError("Login failed: No token received.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed!");
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
          <h2 className="text-3xl font-bold text-white text-center mb-8">Welcome Back</h2>
          
          <div className="space-y-6">
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
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-gray-400 text-center">
              New here?{' '}
              <Link to="/signup" className="text-orange-500 hover:text-orange-400 font-medium">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;