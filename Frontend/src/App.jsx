import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import CommunityList from './pages/community/CommunityList';
import MCQTest from './pages/mcq/MCQTest';
import MCQDashboard from './pages/mcq/MCQDashboard';
import MCQCreator from './pages/mcq/MCQCreator';
import TaskResults from './pages/mcq/TaskResults';
import ProfilePage from './pages/profile/ProfilePage';

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

function App() {
  const { isAuthenticated, authChecked, checkAuth } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [window.location.pathname]);

  if (!authChecked) {
    return <div className="loader">Initialising Tactical HUD...</div>;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
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
              <Route path="/mcq-hub" element={<ProtectedRoute><MCQDashboard /></ProtectedRoute>} />
              <Route path="/mcq/create" element={<ProtectedRoute><MCQCreator /></ProtectedRoute>} />
              <Route path="/mcq/:id" element={<ProtectedRoute><MCQTest /></ProtectedRoute>} />
              <Route path="/mcq/:id/results" element={<ProtectedRoute><TaskResults /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
