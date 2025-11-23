import './App.css'
import Login from './pages/login'
import Signup from './pages/signup'
import SignupConfirmation from './pages/signupConfirmation'
import StudentDashboard from './pages/student/dashbord'
import MyCourses from './pages/student/myCourses'
import LecturerDashboard from './pages/lecturer/dashboard'
import LecturerMyCourses from './pages/lecturer/myCourses'
import LecturerManageCourses from './pages/lecturer/manageCourses'
import AdminDashboard from './pages/admin/dashboard'
import ManageUsers from './pages/admin/manageUsers'
import AddDegreeProgram from './pages/admin/addDegreeProgram'
import ManageDegree from './pages/admin/manageDegree'
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios';
import { Toaster } from "react-hot-toast"; 
import { UserContextProvider } from './context/userContext'
import ForgetPassword from './pages/forgetPassword';
import ResetPassword from './pages/resetPassword';

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
          <Route path="/signup-confirmation" element={<SignupConfirmation />} />
          <Route path="/studentDashboard" element={<StudentDashboard />} />
          <Route path="/studentDashboard/my-courses" element={<MyCourses />} />
          <Route path="/lecturerDashboard" element={<LecturerDashboard />} />
          <Route path="/lecturerDashboard/my-courses" element={<LecturerMyCourses />} />
          <Route path="/lecturerDashboard/manage-courses" element={<LecturerManageCourses />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/adminDashboard/manage-degree" element={<ManageDegree />} />
          <Route path="/admin/add-degree" element={<AddDegreeProgram />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/adminDashboard/manage-users" element={<ManageUsers />} />
          <Route path="/forgetpassword" element={<ForgetPassword/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />
        </Routes>
      </UserContextProvider>
    </>
  )
}

export default App
