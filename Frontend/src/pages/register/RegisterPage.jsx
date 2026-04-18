import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { UserPlus, Mail, Lock, User, GraduationCap, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';

const RegisterPage = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
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
    { value: 'CBSE', label: 'CBSE Mainframe' },
    { value: 'ICSE', label: 'ICSE Protocol' },
    { value: 'WBCHSE', label: 'WBCHSE Node' },
  ];

  const interestOptions = [
    { value: 'science', label: 'Scientific Research' },
    { value: 'coding', label: 'Cyber Security & Coding' },
    { value: 'creative', label: 'Creative Design' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus size={32} className="glow-icon" />
          </div>
          <h1 className="glow-text">Identity Registration</h1>
          <p>Create your operative profile to begin missions</p>
        </div>

        {serverError && (
          <div className="auth-error" role="alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name-input">Full Operative Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" aria-hidden="true" />
              <input
                id="name-input"
                type="text"
                placeholder="Operative Name"
                {...register('name', { required: 'Name is required' })}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
            </div>
            {errors.name && <span id="name-error" className="error-msg" role="alert">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email-input">Identity Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" aria-hidden="true" />
              <input
                id="email-input"
                type="email"
                placeholder="commander@xmentor.space"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid transmission format' }
                })}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && <span id="email-error" className="error-msg" role="alert">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Security Key</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" aria-hidden="true" />
              <input
                id="password-input"
                type="password"
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters required' }
                })}
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
            </div>
            {errors.password && <span id="password-error" className="error-msg" role="alert">{errors.password.message}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <Controller
                name="board"
                control={control}
                rules={{ required: 'Board selection required' }}
                render={({ field }) => (
                  <GlassDropdown
                    label="Education Board"
                    options={boardOptions}
                    value={field.value}
                    onChange={field.onChange}
                    icon={GraduationCap}
                    placeholder="Select Node"
                  />
                )}
              />
              {errors.board && <span className="error-msg" role="alert">{errors.board.message}</span>}
            </div>

            <div className="form-group">
              <Controller
                name="interest"
                control={control}
                rules={{ required: 'Major interest required' }}
                render={({ field }) => (
                  <GlassDropdown
                    label="Primary Directive"
                    options={interestOptions}
                    value={field.value}
                    onChange={field.onChange}
                    icon={Sparkles}
                    placeholder="Select Path"
                  />
                )}
              />
              {errors.interest && <span className="error-msg" role="alert">{errors.interest.message}</span>}
            </div>
          </div>

          <button type="submit" className="auth-btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Registeringoperatieve...</span>
              </>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Initiate Identity</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already registered? <Link to="/login">Access Mainframe</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
