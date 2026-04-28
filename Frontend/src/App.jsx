import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import useHUDNotifications from './hooks/useHUDNotifications';
import { Toaster } from 'react-hot-toast';
import LoadingOverlay from './components/ui/LoadingOverlay';

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
import Leaderboard from './pages/leaderboard/Leaderboard';
import SubjectiveCreator from './pages/subjective/SubjectiveCreator';
import SubjectiveView from './pages/subjective/SubjectiveView';
import SubjectiveHub from './pages/subjective/SubjectiveHub';
import ReviewCenter from './pages/subjective/ReviewCenter';
import NotFoundPage from './pages/error/NotFoundPage';
import MaintenancePage from './pages/error/MaintenancePage';

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
  const { isServerDown, isLoading, user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Initialize Global HUD Notifications
  useHUDNotifications();

  // If server is down, override everything with Maintenance Page
  if (isServerDown) {
    return <MaintenancePage />;
  }

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // Detect if we are in a tactical MCQ operation (MCQ Test Page)
  // Matches /mcq/:id but excludes /mcq, /mcq/create, and /mcq/:id/results
  const isMCQTestPage = /^\/mcq\/[^\/]+$/.test(location.pathname) &&
    location.pathname !== '/mcq/create';

  return (
    <div className={`app-container ${isAuthenticated ? 'with-sidebar' : 'auth-mode'} ${isSidebarOpen ? 'sidebar-open' : ''} ${isMCQTestPage ? 'tactical-mode' : ''} theme-${user?.theme || 'blue'}`}>
      {isLoading && <LoadingOverlay message="Terminating Strategic Session..." />}
      {isAuthenticated && !isMCQTestPage && (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}

      <div className="main-layout">
        {!isMCQTestPage && <Navbar onMenuClick={toggleSidebar} />}
        <main className={`content ${isMCQTestPage ? 'full-width-tactical' : ''}`}>
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
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

            <Route path="/subjective" element={<ProtectedRoute><SubjectiveHub /></ProtectedRoute>} />
            <Route path="/subjective/create" element={<ProtectedRoute><SubjectiveCreator /></ProtectedRoute>} />
            <Route path="/subjective/:id" element={<ProtectedRoute><SubjectiveView /></ProtectedRoute>} />
            <Route path="/subjective/review" element={<ProtectedRoute><ReviewCenter /></ProtectedRoute>} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFoundPage />} />
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
      <Toaster />
      <AppContent isAuthenticated={isAuthenticated} />
    </Router>
  );
}

export default App;
