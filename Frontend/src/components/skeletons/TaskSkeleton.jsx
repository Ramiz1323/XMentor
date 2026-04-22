import Skeleton from '../ui/Skeleton';

const TaskSkeleton = () => (
  <div className="glass-card task-card skeleton-card">
    <div className="card-header" style={{ marginBottom: '1.5rem' }}>
      <div className="title-group">
        <Skeleton width="60px" height="18px" className="mb-2" />
        <Skeleton width="180px" height="24px" />
      </div>
      <Skeleton width="50px" height="50px" variant="circle" />
    </div>
    <div className="card-meta" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
      <Skeleton width="100px" height="16px" />
      <Skeleton width="100px" height="16px" />
    </div>
    <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Skeleton width="32px" height="32px" variant="circle" />
        <Skeleton width="100px" height="14px" />
      </div>
      <Skeleton width="120px" height="40px" />
    </div>
  </div>
);

export default TaskSkeleton;
