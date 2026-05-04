import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import StaffLogin from './component/auth/StaffLogin';
import StudentLogin from './component/auth/StudentLogin';
import StudentRegistrationForm from './component/student/registration/StudentRegistrationForm';
import StudentDashboard from './component/student/StudentDashboard';
import Homepage from './pages/Homepage';
import AdminDashboard from './component/admin/AdminDashboard';
import InstructorDashboard from './component/Instructor/InstructorDashboard';
import AcademicAdminDashboard from './component/Academic Admin/AcademicAdminDashboard';
import ManagementDashboard from './component/Management/ManagementDashboard';
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedUserTypes?: ('student' | 'staff')[];
}> = ({ children, allowedUserTypes = ['student', 'staff'] }) => {
  const { isAuthenticated, isLoading, userType } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (userType && !allowedUserTypes.includes(userType)) {
    if (userType === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

function AppContent() {
  const { userType } = useAuth();
  
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login/staff" element={<StaffLogin />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/register" element={<StudentRegistrationForm />} />
        
     <Route
  path="/dashboard/*"
  element={
    <ProtectedRoute allowedUserTypes={['staff']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
        
        {/* Student Routes */}
       <Route
  path="/student-dashboard/*"
  element={
    <ProtectedRoute allowedUserTypes={['student']}>
      <StudentDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/instructor-dashboard/*"
  element={
    <ProtectedRoute allowedUserTypes={['staff']}>
      <InstructorDashboard />
    </ProtectedRoute>
  }
/>
       <Route
  path="/academic-admin-dashboard/*"
  element={
    <ProtectedRoute allowedUserTypes={['staff']}>
      <AcademicAdminDashboard />
    </ProtectedRoute>
  }
/> 
<Route path="/management-dashboard/*" element={
  <ProtectedRoute allowedUserTypes={['staff']}>
    <ManagementDashboard />
  </ProtectedRoute>
} />
        {/* Catch all - redirect to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
