import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await axios.post('http://localhost:3000/api/auth/forgetpassword', { email });
      setMessage(response.data.message || "You will receive a password reset link.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sending reset email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-emerald-100 to-emerald-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-emerald-600 font-bold text-lg">LMS</div>
          <h2 className="text-3xl font-extrabold mt-2">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 h-50%">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email Address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sxxxxx@sci.pdn.ac.lk"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                         focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 p-2"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 
                       rounded-md shadow transition duration-200"
          >
            Send Verification Link
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="mt-4 text-center text-green-600 text-sm">{message}</p>
        )}

        {/* Back to Login */}
        <button
          onClick={() => navigate("/login")}
          className="w-full mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium 
                     py-2 px-4 rounded-md transition duration-200"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgetPassword;
