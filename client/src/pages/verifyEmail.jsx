import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const token = searchParams.get("token");
        
        if (!token) {
            setMessage("Invalid verification link");
            setVerifying(false);
            return;
        }

        const verifyEmailAddress = async (token) => {
            try {
                const response = await axios.post("/verify-email", { token });
                
                if (response.data.message) {
                    setMessage(response.data.message);
                    setSuccess(true);
                    toast.success(response.data.message);
                    
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        navigate("/login");
                    }, 3000);
                }
            } catch (error) {
                const errorMsg = error?.response?.data?.message || "Verification failed";
                setMessage(errorMsg);
                setSuccess(false);
                toast.error(errorMsg);
            } finally {
                setVerifying(false);
            }
        };

        verifyEmailAddress(token);
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-300 p-5">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <div className="text-center">
                    <div className="text-emerald-600 font-bold text-2xl mb-4">GeoLMS</div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Email Verification
                    </h2>

                    {verifying ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                            <p className="text-gray-600">Verifying your email...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            {success ? (
                                <>
                                    <div className="rounded-full bg-green-100 p-3">
                                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-green-600 font-medium text-lg">{message}</p>
                                    <p className="text-gray-600">Redirecting to login page...</p>
                                </>
                            ) : (
                                <>
                                    <div className="rounded-full bg-red-100 p-3">
                                        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <p className="text-red-600 font-medium text-lg">{message}</p>
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                        Go to Login
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
