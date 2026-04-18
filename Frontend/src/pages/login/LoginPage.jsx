import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError('');
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Identity verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card login">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <LogIn size={32} className="glow-icon" />
          </div>
          <h1 className="glow-text">Sign In</h1>
          <p>Login to your account to continue</p>
        </div>

        {serverError && (
          <div className="auth-error" role="alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email-input">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" aria-hidden="true" />
              <input
                id="email-input"
                type="email"
                placeholder="name@example.com"
                className="glass-input with-icon"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email format"
                  }
                })}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <span id="email-error" className="error-msg" role="alert">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" aria-hidden="true" />
              <input
                id="password-input"
                type="password"
                placeholder="••••••••"
                className="glass-input with-icon"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
            </div>
            {errors.password && (
              <span id="password-error" className="error-msg" role="alert">
                {errors.password.message}
              </span>
            )}
          </div>

          <button type="submit" className="auth-btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>New to XMentor? <Link to="/register">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
