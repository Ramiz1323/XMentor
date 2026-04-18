import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Mail, Lock, User, GraduationCap, Users } from 'lucide-react';
import { useState } from 'react';
import GlassDropdown from '../../components/ui/GlassDropdown';

const RegisterPage = () => {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      role: 'STUDENT',
      board: 'CBSE'
    }
  });
  const { register: registerAction } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      const formattedData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        boardInfo: {
          board: data.board,
          class: data.class,
        }
      };
      await registerAction(formattedData);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'TEACHER', label: 'Teacher' }
  ];

  const boardOptions = [
    { value: 'CBSE', label: 'CBSE' },
    { value: 'ICSE', label: 'ICSE' },
    { value: 'WB', label: 'WB Board' },
    { value: 'NONE', label: 'B.Tech / Other' }
  ];

  return (
    <div className="auth-page">
      <div className="auth-card register">
        <div className="auth-header">
          <h2 className="glow-text">Create Account</h2>
          <p>Join the XMentor learning community</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form grid">
          <div className="input-group full-width">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} className="input-icon" />
              <input {...register('name', { required: 'Name is required' })} className="glass-input with-icon" placeholder="John Doe" />
            </div>
            {errors.name && <span className="error-text">{errors.name.message}</span>}
          </div>

          <div className="input-group full-width">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} className="input-icon" />
              <input {...register('email', { required: 'Email is required' })} type="email" placeholder="john@example.com" className="glass-input with-icon" />
            </div>
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <GlassDropdown 
                  label="Role"
                  options={roleOptions}
                  value={field.value}
                  onChange={field.onChange}
                  icon={Users}
                />
              )}
            />
          </div>

          <div className="input-group">
             <Controller
              name="board"
              control={control}
              render={({ field }) => (
                <GlassDropdown 
                  label="Education Board"
                  options={boardOptions}
                  value={field.value}
                  onChange={field.onChange}
                  icon={GraduationCap}
                />
              )}
            />
          </div>

          <div className="input-group full-width">
             <label>Class / Year</label>
             <input {...register('class', { required: 'Class is required' })} className="glass-input" placeholder="e.g. 10 or 2nd Year" />
             {errors.class && <span className="error-text">{errors.class.message}</span>}
          </div>

          <div className="input-group full-width">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} className="input-icon" />
              <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} type="password" placeholder="••••••••" className="glass-input with-icon" />
            </div>
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-primary full-width flex-center" disabled={loading} style={{ gap: '0.5rem', marginTop: '1rem' }}>
            {loading ? 'Creating account...' : <><GraduationCap size={18} /> Join XMentor</>}
          </button>
        </form>

        <p className="auth-footer">
          Already part of the team? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
