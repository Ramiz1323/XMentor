import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import useHUDNotifications from './hooks/useHUDNotifications';
import { Toaster } from 'react-hot-toast';
import LoadingOverlay from './components/ui/LoadingOverlay';

const LoginPage = lazy(() => import('./pages/login/LoginPage'));
const RegisterPage = lazy(() => import('./pages/register/RegisterPage'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const CommunityList = lazy(() => import('./pages/community/CommunityList'));
const ChatRoom = lazy(() => import('./pages/community/ChatRoom'));
const MCQTest = lazy(() => import('./pages/mcq/MCQTest'));
const MCQDashboard = lazy(() => import('./pages/mcq/MCQDashboard'));
const MCQCreator = lazy(() => import('./pages/mcq/MCQCreator'));
const TaskResults = lazy(() => import('./pages/mcq/TaskResults'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const DoubtDashboard = lazy(() => import('./pages/doubt/DoubtDashboard'));
const Leaderboard = lazy(() => import('./pages/leaderboard/Leaderboard'));
const SubjectiveCreator = lazy(() => import('./pages/subjective/SubjectiveCreator'));
const SubjectiveView = lazy(() => import('./pages/subjective/SubjectiveView'));
const SubjectiveHub = lazy(() => import('./pages/subjective/SubjectiveHub'));
const ReviewCenter = lazy(() => import('./pages/subjective/ReviewCenter'));
const NotFoundPage = lazy(() => import('./pages/error/NotFoundPage'));
const MaintenancePage = lazy(() => import('./pages/error/MaintenancePage'));
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));

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
  const { isServerDown, isLoading, user, authChecked } = useAuthStore();
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

  // Only show the landing page once we know the user is definitely NOT authenticated
  const isLandingPage = location.pathname === '/' && authChecked && !isAuthenticated;

  return (
    <div className={`app-container ${isAuthenticated ? 'with-sidebar' : isLandingPage ? 'landing-mode' : 'auth-mode'} ${isSidebarOpen ? 'sidebar-open' : ''} ${isMCQTestPage ? 'tactical-mode' : ''} theme-${user?.theme || 'blue'}`}>
      {isLoading && <LoadingOverlay message="Terminating Strategic Session..." />}
      {isAuthenticated && !isMCQTestPage && (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}

      <div className="main-layout">
        {!isMCQTestPage && !isLandingPage && <Navbar onMenuClick={toggleSidebar} />}
        <main className={`content ${isMCQTestPage ? 'full-width-tactical' : ''}`}>
          <Suspense fallback={<LoadingOverlay message="Establishing Data Link..." />}>
            <Routes>
              <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

              <Route path="/" element={
                !authChecked
                  ? null
                  : isAuthenticated
                    ? <ProtectedRoute><Dashboard /></ProtectedRoute>
                    : <LandingPage />
              } />
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
          </Suspense>
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
