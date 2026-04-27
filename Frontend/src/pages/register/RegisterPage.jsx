import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { UserPlus, Mail, Lock, User, GraduationCap, Sparkles, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';

const RegisterPage = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: { role: 'STUDENT' }
  });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerOperative } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError('');
      await registerOperative(data);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Identity registration failed');
    } finally {
      setLoading(false);
    }
  };

  const boardOptions = [
    { value: 'CBSE', label: 'CBSE' },
    { value: 'ICSE', label: 'ICSE' },
    { value: 'WB', label: 'WB Board' },
  ];



  return (
    <div className="auth-page">
      <div className="auth-card glass-card register">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus size={32} className="glow-icon" />
          </div>
          <h1 className="glow-text">Create Account</h1>
          <p>Create your profile to join the learning community</p>
        </div>

        {serverError && (
          <div className="auth-error" role="alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name-input">Full Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" aria-hidden="true" />
              <input
                id="name-input"
                type="text"
                placeholder="Full Name"
                className="glass-input with-icon"
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && <span id="name-error" className="error-msg" role="alert">{errors.name.message}</span>}
          </div>

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
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                })}
              />
            </div>
            {errors.email && <span id="email-error" className="error-msg" role="alert">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" aria-hidden="true" />
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="glass-input with-icon with-toggle"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters required' }
                })}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span id="password-error" className="error-msg" role="alert">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <Controller
              name="board"
              control={control}
              rules={{ required: 'Board selection required' }}
              render={({ field }) => (
                <GlassDropdown
                  label="Board"
                  options={boardOptions}
                  value={field.value}
                  onChange={field.onChange}
                  icon={GraduationCap}
                  placeholder="Select Board"
                />
              )}
            />
            {errors.board && <span className="error-msg" role="alert">{errors.board.message}</span>}
          </div>

          <button type="submit" className="auth-btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already registered? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
