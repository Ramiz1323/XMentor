import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import CommunityList from './pages/community/CommunityList';
import MCQTest from './pages/mcq/MCQTest';
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

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!authChecked) {
    return <div className="loader">Initialising Tactical HUD...</div>;
  }

  return (
    <Router>
      <div className={`app-container ${isAuthenticated ? 'with-sidebar' : 'auth-mode'}`}>
        {isAuthenticated && <Sidebar />}
        
        <div className="main-layout">
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
              
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/communities" element={<ProtectedRoute><CommunityList /></ProtectedRoute>} />
              <Route path="/mcq/:id" element={<ProtectedRoute><MCQTest /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
