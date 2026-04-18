import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useState } from 'react';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card login">
        <div className="auth-header">
          <h2 className="glow-text">Login</h2>
          <p>Welcome back to XMentor</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} className="input-icon" />
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                placeholder="email@example.com"
                className="glass-input with-icon"
              />
            </div>
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} className="input-icon" />
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                placeholder="••••••••"
                className="glass-input with-icon"
              />
            </div>
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-primary flex-center" disabled={loading} style={{ gap: '0.5rem', marginTop: '1rem' }}>
            {loading ? 'Logging in...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
