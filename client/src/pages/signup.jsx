import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Googleicon from "../assets/googleicon.png";  
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export default function Signup() {
    const navigate = useNavigate();

    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const onChange = (e) => {
        setData((d) => ({ ...d, [e.target.name]: e.target.value }));
        setErrors((err) => ({ ...err, [e.target.name]: "" }));
    };

    // -------------------------------
    // VALIDATION (restrict domain)
    // -------------------------------
    const validate = () => {
        const errs = {};

        if (!data.firstName.trim()) errs.firstName = "First name is required";
        if (!data.lastName.trim()) errs.lastName = "Last name is required";

        if (!data.email.trim()) errs.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(data.email)) errs.email = "Invalid email";
        else if (!data.email.endsWith("@sci.pdn.ac.lk"))
            errs.email = "Only @sci.pdn.ac.lk emails are allowed";

        if (!data.password) errs.password = "Password is required";
        if (!data.confirmPassword) errs.confirmPassword = "Please re-enter password";

        if (data.password !== data.confirmPassword)
            errs.confirmPassword = "Passwords do not match";

        return errs;
    };

    const register = async (e) => {
        e.preventDefault();

        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post("/register", data);

            if (response.data.error) {
                toast.error(response.data.error);
            } else if (response.data.message) {
                toast.success(response.data.message);
                // Navigate to OTP verification page with email
                navigate("/signup-confirmation", { state: { email: data.email } });
            }
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to sign up");
        } finally {
            setSubmitting(false);
        }
    };

    // Google signup
    const onGoogleSignup = () => {
        window.location.href = "http://localhost:3000/google";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-300 p-5">

            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-7">
                <div className="text-emerald-600 font-bold text-lg">LMS</div>

                <h2 className="text-xl font-semibold text-gray-900 mb-4 pt-1">Sign up now</h2>
                {errors.form && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
                        {errors.form}
                    </div>
                )}

                <form className="flex flex-col gap-3" onSubmit={register} noValidate>

                    <div className="flex gap-3">
                        <div className="flex-1 flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">First name</label>
                            <input
                                name="firstName"
                                value={data.firstName}
                                onChange={onChange}
                                className="h-10 px-3 rounded-md border border-gray-200 text-sm"
                                placeholder="first name"
                            />
                            {errors.firstName && <div className="text-red-600 text-xs">{errors.firstName}</div>}
                        </div>

                        <div className="flex-1 flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Last name</label>
                            <input
                                name="lastName"
                                value={data.lastName}
                                onChange={onChange}
                                className="h-10 px-3 rounded-md border border-gray-200 text-sm"
                                placeholder="last name"
                            />
                            {errors.lastName && <div className="text-red-600 text-xs">{errors.lastName}</div>}
                        </div>
                    </div>

                    <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={onChange}
                        className="h-10 px-3 rounded-md border border-gray-200 text-sm"
                        placeholder="sxxxxx@sci.pdn.ac.lk"
                    />
                    {errors.email && <div className="text-red-600 text-xs">{errors.email}</div>}

                    <label className="text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        name="role"
                        value={data.role}
                        onChange={onChange}
                        className="h-10 px-3 rounded-md border border-gray-200 text-sm"
                    >
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="admin">Admin</option>
                    </select>

                    <label className="text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={onChange}
                        className="h-10 px-3 rounded-md border border-gray-200 text-sm"
                        placeholder="Choose a strong password"
                    />
                    {errors.password && <div className="text-red-600 text-xs">{errors.password}</div>}

                    <label className="text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        value={data.confirmPassword}
                        onChange={onChange}
                        className="h-10 px-3 rounded-md border border-gray-200 text-sm"
                        placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <div className="text-red-600 text-xs">{errors.confirmPassword}</div>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-2 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold shadow"
                    >
                        {submitting ? "Signing up..." : "Create account"}
                    </button>
                </form>

                <div className="text-center mt-3 mb-2 text-gray-500 text-sm">or</div>

                <button
                    onClick={onGoogleSignup}
                    className="w-full h-11 flex items-center justify-center gap-2 bg-white border border-gray-500 rounded-md"
                >
                    <img src={Googleicon} className="h-4 w-4" alt="Google" />
                    <span className=" font-semibold text-sm">Sign up using Google</span>
                </button>

                <div className="mt-4 text-center text-gray-500 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-emerald-600 font-medium hover:underline">Log in</Link>
                </div>
            </div>
        </div>
    );
}
