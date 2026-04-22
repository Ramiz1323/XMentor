import Skeleton from '../ui/Skeleton';

const CommunitySkeleton = () => (
  <div className="community-card skeleton-card">
    <div className="card-top" style={{ marginBottom: '1rem' }}>
      <div style={{ flex: 1 }}>
        <Skeleton width="120px" height="24px" className="mb-2" />
        <Skeleton width="60px" height="18px" />
      </div>
      <Skeleton width="40px" height="16px" />
    </div>
    <Skeleton width="100%" height="60px" className="mb-4" />
    <div className="card-footer">
      <Skeleton width="100%" height="44px" />
    </div>
  </div>
);

export default CommunitySkeleton;
