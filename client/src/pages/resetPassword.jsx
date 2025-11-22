import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        // Decode token to get email
        const token = searchParams.get('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserEmail(decoded.email || '');
            } catch (err) {
                console.error('Failed to decode token:', err);
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const token = searchParams.get('token');
            await axios.post('http://localhost:3000/api/auth/resetpassword', { token, password });
            setSuccess('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-300 p-5">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-7">
                <div className="text-emerald-600 font-bold text-lg">LMS</div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2 pt-1">Reset Password</h2>
                <p className="text-sm text-gray-600 mb-1">Enter your new password</p>
                {userEmail && (
                    <p className="text-sm text-gray-500 mb-4">for {userEmail}</p>
                )}

                {error && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 text-green-700 p-2 rounded mb-3 text-sm">
                        {success}
                    </div>
                )}

                <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
                    <label className="text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 px-3 rounded-md border border-gray-200 text-sm"
                        placeholder="Enter new password"
                    />

                    <label className="text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-10 px-3 rounded-md border border-gray-200 text-sm"
                        placeholder="Confirm new password"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold shadow disabled:bg-emerald-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-4 text-center text-gray-500 text-sm">
                    Remember your password?{" "}
                    <Link to="/login" className="text-emerald-600 font-medium hover:underline">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;