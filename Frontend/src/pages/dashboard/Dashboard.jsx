import { useEffect, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { BookOpen, Users, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ communities: 0, tests: 0 });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [commRes] = await Promise.all([
          api.get('/community')
        ]);
        setStats({
          communities: commRes.data.data.length,
          tests: 0
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="dashboard-container">
      <header>
        <h1 className="glow-text">Welcome back, {user?.name}!</h1>
        <p>Your learning journey continues here.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-box blue">
            <Users size={32} color="#3b82f6" />
          </div>
          <div className="stat-info">
            <h3>{stats.communities}</h3>
            <p>Communities Available</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box cyan">
            <BookOpen size={32} color="#22d3ee" />
          </div>
          <div className="stat-info">
            <h3>{stats.tests}</h3>
            <p>Completed Tests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box gold">
            <Trophy size={32} color="#fbbf24" />
          </div>
          <div className="stat-info">
            <h3>{user?.role}</h3>
            <p>Account Level</p>
          </div>
        </div>
      </div>

      <section className="actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/communities" className="action-card">
            <h4>Join Community</h4>
            <p>Connect with peers</p>
          </Link>
          <div className="action-card">
            <h4>Practice MCQ</h4>
            <p>Test your knowledge</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
