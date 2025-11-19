
import './App.css'
import Login from './pages/login'
import Signup from './pages/signup'
import StudentDashboard from './pages/student/dashbord'

import LecturerDashboard from './pages/lecturer/dashboard'
import AdminDashboard from './pages/admin/dashboard'  
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios';
import  { Toaster } from "react-hot-toast"; 
import { UserContextProvider } from './context/userContext'
import ForgetPassword from './pages/forgetPassword';


axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;


function App() {
  return (

    <>
    <UserContextProvider>
      <Toaster position='bottom-right' toastOptions={{duration:2000}} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/studentDashboard" element={<StudentDashboard />} />
        <Route path="/lecturerDashboard" element={<LecturerDashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route  path="/forgetpassword" element={<ForgetPassword/>} />
      </Routes>
      </UserContextProvider>
    </>
  )
}

export default App
