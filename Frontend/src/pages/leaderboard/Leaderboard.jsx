import { useEffect } from 'react';
import useUserStore from '../../store/useUserStore';
import { Trophy, Medal, Target, BookOpen, Crown } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';

const Leaderboard = () => {
  const { leaderboard, fetchLeaderboard, isLoading } = useUserStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return <Crown className="rank-icon gold" size={24} />;
      case 2: return <Medal className="rank-icon silver" size={24} />;
      case 3: return <Medal className="rank-icon bronze" size={24} />;
      default: return <span className="rank-number">{rank}</span>;
    }
  };

  return (
    <div className="leaderboard-container">
      <header className="leaderboard-header">
        <h1 className="glow-text">Global Elite Leaderboard</h1>
        <p>Recognizing the top tactical minds in the XMentor network.</p>
      </header>

      <div className="leaderboard-podium">
        {isLoading ? (
          <Skeleton width="100%" height="200px" />
        ) : (
          leaderboard.slice(0, 3).map((student, idx) => (
            <div key={student.id} className={`podium-spot rank-${student.rank} glass-card`}>
              <div className="avatar-wrapper">
                {student.profilePic ? (
                  <img src={student.profilePic} alt={student.name} />
                ) : (
                  <div className="avatar-placeholder">{student.name.charAt(0)}</div>
                )}
                <div className="rank-badge">{getRankBadge(student.rank)}</div>
              </div>
              <div className="podium-info">
                <h3>{student.name}</h3>
                <span className="accuracy">{student.accuracy}% Accuracy</span>
                <span className="score">{student.score} PTS</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="leaderboard-list glass-card">
        <div className="list-header">
          <div className="col rank">Rank</div>
          <div className="col user">Operative</div>
          <div className="col accuracy">Accuracy</div>
          <div className="col tests">Tests</div>
          <div className="col points">Tactical Points</div>
        </div>

        <div className="list-body">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} width="100%" height="60px" className="mb-2" />)
          ) : (
            leaderboard.map((student) => (
              <div key={student.id} className="list-item">
                <div className="col rank">{getRankBadge(student.rank)}</div>
                <div className="col user">
                  <div className="user-info">
                    {student.profilePic ? (
                      <img src={student.profilePic} alt={student.name} />
                    ) : (
                      <div className="avatar-placeholder">{student.name.charAt(0)}</div>
                    )}
                    <div className="names">
                      <span className="name">{student.name}</span>
                      <span className="username">@{student.username}</span>
                    </div>
                  </div>
                </div>
                <div className="col accuracy">
                  <div className="accuracy-pill">
                    <Target size={14} />
                    {student.accuracy}%
                  </div>
                </div>
                <div className="col tests">
                  <div className="tests-pill">
                    <BookOpen size={14} />
                    {student.totalTests}
                  </div>
                </div>
                <div className="col points">
                  <span className="pts">{student.score}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
