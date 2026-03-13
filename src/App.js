import Attendance from './pages/Attendance';
import Growth from './pages/Growth';
import QRCheckIn from './pages/QRCheckIn';
import Landing from './pages/Landing';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';

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
          <Route path="/" element={<Landing />} />
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
          <Route 
            path="/growth" 
            element={
              <ProtectedRoute>
                <Growth />
              </ProtectedRoute>
            } 
          />
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
                <Alerts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route path="/checkin/:orgId/:serviceId" element={<QRCheckIn />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

