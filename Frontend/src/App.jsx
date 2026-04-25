import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import CommunityList from './pages/community/CommunityList';
import ChatRoom from './pages/community/ChatRoom';
import MCQTest from './pages/mcq/MCQTest';
import MCQDashboard from './pages/mcq/MCQDashboard';
import MCQCreator from './pages/mcq/MCQCreator';
import TaskResults from './pages/mcq/TaskResults';
import ProfilePage from './pages/profile/ProfilePage';
import DoubtDashboard from './pages/doubt/DoubtDashboard';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useAuthStore();
  
  if (!authChecked) return <div className="loader">Verifying Access...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useAuthStore();
  
  if (!authChecked) return null;
  if (isAuthenticated) return <Navigate to="/" />;
  
  return children;
};

function AppContent({ isAuthenticated }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className={`app-container ${isAuthenticated ? 'with-sidebar' : 'auth-mode'} ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {isAuthenticated && (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}
      
      <div className="main-layout">
        <Navbar onMenuClick={toggleSidebar} />
        <main className="content">
          <Routes>
            <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/communities" element={<ProtectedRoute><CommunityList /></ProtectedRoute>} />
            <Route path="/communities/:id/chat" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
            <Route path="/mcq" element={<ProtectedRoute><MCQDashboard /></ProtectedRoute>} />
            <Route path="/mcq/create" element={<ProtectedRoute><MCQCreator /></ProtectedRoute>} />
            <Route path="/mcq/:id" element={<ProtectedRoute><MCQTest /></ProtectedRoute>} />
            <Route path="/mcq/:id/results" element={<ProtectedRoute><TaskResults /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/doubts" element={<ProtectedRoute><DoubtDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, authChecked, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!authChecked) {
    return <div className="loader">Initialising Tactical HUD...</div>;
  }

  return (
    <Router>
      <AppContent isAuthenticated={isAuthenticated} />
    </Router>
  );
}

export default App;
