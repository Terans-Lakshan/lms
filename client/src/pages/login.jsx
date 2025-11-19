import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Googleicon from "../assets/googleicon.png";
import axios from "axios";
import toast from "react-hot-toast";
import loginImage from "../assets/lms.jpg";

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  // const onChange = (e) => {
  //   setEmail((e) => e.target.value);
  //   setPassword((e) => e.target.value); 
  //   setRemember((e) => e.target.checked);
  // }};


  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/login', { email, password });
     
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success("Login successful!");
        const role=response.data.user.role;
        if(role==="student"){
          navigate("/studentDashboard");
        }
        else if(role==="lecturer"){
          navigate("/lecturerDashboard");
        }
        else if(role==="admin"){
          navigate("/adminDashboard");
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to login");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-emerald-100 to-emerald-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <div className="text-emerald-600 font-bold text-lg">LMS</div>
            <h1 className="text-3xl font-extrabold mt-2">Welcome Back!</h1>
            <p className="text-sm text-gray-500 mt-2">Please sign in to your account</p>
          </div>

          <form onSubmit={loginUser} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 p-2"
                placeholder="sxxxxx@sci.pdn.ac.lk"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 p-2"
                placeholder="Enter your password"
              />
            </label>

            <div className="flex items-center justify-between">
              
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>

              
              <a href="#" className="text-sm text-emerald-600 hover:underline" onClick={()=> navigate("/ForgetPassword")  }>Forgot password?</a>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md shadow"
                onClick={loginUser}  // double check this line
              >
                Sign In
              </button>

              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                onClick={() => navigate("/signup")}
              >
                Create an account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">or continue with</div>
          <div className="mt-3 flex gap-3">
            <button className="flex-1 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 justify-center inline-flex items-center gap-2" > <img src={Googleicon} alt="google icon" className="h-5 w-5" />Google</button>
            
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-600 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Right: image */}
        <div className="hidden md:block">
          <div className="h-full w-full object-cover">
            <img
              src={loginImage}
              alt="Decorative parrot illustration"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
