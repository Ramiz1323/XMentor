import Skeleton from '../ui/Skeleton';

const ProfileSkeleton = () => {
  return (
    <div className="profile-page">
      <header>
        <Skeleton width="250px" height="32px" className="mb-2" />
        <Skeleton width="200px" height="16px" />
      </header>

      <div className="profile-card">
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <Skeleton width="100px" height="100px" variant="circle" />
          </div>
          <div className="user-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Skeleton width="180px" height="28px" />
              <Skeleton width="80px" height="20px" variant="rect" style={{ borderRadius: '12px' }} />
            </div>
            <Skeleton width="220px" height="16px" />
          </div>
        </div>

        <div className="settings-form mt-8">
          <div className="input-group">
            <Skeleton width="100px" height="14px" className="mb-2" />
            <Skeleton width="100%" height="48px" />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="input-group">
              <Skeleton width="80px" height="14px" className="mb-2" />
              <Skeleton width="100%" height="48px" />
            </div>
            <div className="input-group">
              <Skeleton width="80px" height="14px" className="mb-2" />
              <Skeleton width="100%" height="48px" />
            </div>
          </div>

          <Skeleton width="200px" height="50px" className="mt-8" />
        </div>
      </div>

      <div className="profile-card" style={{ marginTop: '2rem' }}>
        <div className="mb-8">
          <Skeleton width="200px" height="24px" className="mb-2" />
          <Skeleton width="300px" height="14px" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} width="100%" height="70px" variant="rect" style={{ borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
