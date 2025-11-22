import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

function SignupConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Get email from location state
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If no email in state, redirect to signup
      toast.error("Please sign up first");
      navigate("/signup");
    }
  }, [location, navigate]);

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp });
      
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success("Email verified successfully!");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    try {
      const response = await axios.post('/resend-otp', { email });
      
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success("New OTP sent to your email!");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-emerald-100 to-emerald-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <div className="text-emerald-600 font-bold text-lg">LMS</div>
            <h1 className="text-3xl font-extrabold mt-2">Verify Your Email</h1>
            <p className="text-sm text-gray-500 mt-2">
              We've sent a 6-digit OTP to <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Check your email</p>
                <p className="text-xs text-blue-700 mt-1">
                  Please enter the OTP code sent to your email address to complete registration.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={verifyOtp} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Enter OTP</span>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 p-3 text-center text-2xl tracking-widest font-semibold"
                placeholder="000000"
              />
            </label>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                onClick={resendOtp}
                disabled={resending}
                className="text-emerald-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/signup")}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Sign up
            </button>
          </div>
        </div>

        
        
      </div>
    </div>
  );
}

export default SignupConfirmation;
