import Attendance from './pages/Attendance';
import Alerts from './pages/Alerts';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/members" 
            element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            } 
          />
          {/* Placeholder routes */}
         <Route 
  path="/attendance" 
  element={
    <ProtectedRoute>
      <Attendance />
    </ProtectedRoute>
  } 
/>
          <Route 
            path="/alerts" 
            element={
              <ProtectedRoute>
                <div style={{padding: '2rem'}}>
                  <h1>⏳ Alerts - Coming Soon</h1>
                  <p>We'll build this soon!</p>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <div style={{padding: '2rem'}}>
                  <h1>⏳ Reports - Coming Soon</h1>
                  <p>We'll build this soon!</p>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/checkin/:orgId/:serviceId" element={<QRCheckIn />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;