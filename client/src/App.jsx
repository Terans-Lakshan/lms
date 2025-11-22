import './App.css'
import Login from './pages/login'
import Signup from './pages/signup'
import SignupConfirmation from './pages/signupConfirmation'
import StudentDashboard from './pages/student/dashbord'
import MyCourses from './pages/student/myCourses'
import Results from './pages/student/results'
import LecturerDashboard from './pages/lecturer/dashboard'
import LecturerMyCourses from './pages/lecturer/myCourses'
import LecturerResults from './pages/lecturer/results'
import AdminDashboard from './pages/admin/dashboard'
import ManageCourses from './pages/admin/manageCourses'
import ManageUsers from './pages/admin/manageUsers'
import AddDegreeProgram from './pages/admin/addDegreeProgram'
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
          <Route path="/studentDashboard/results" element={<Results />} />
          <Route path="/lecturerDashboard" element={<LecturerDashboard />} />
          <Route path="/lecturerDashboard/my-courses" element={<LecturerMyCourses />} />
          <Route path="/lecturerDashboard/results" element={<LecturerResults />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/add-degree" element={<AddDegreeProgram />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/adminDashboard/manage-courses" element={<ManageCourses />} />
          <Route path="/adminDashboard/manage-users" element={<ManageUsers />} />
          <Route path="/forgetpassword" element={<ForgetPassword/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />
        </Routes>
      </UserContextProvider>
    </>
  )
}

export default App
