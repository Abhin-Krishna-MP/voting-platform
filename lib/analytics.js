// Analytics and metrics utilities
export function calculateVoteMetrics(candidates, voters) {
  const totalVotes = candidates.reduce((acc, c) => acc + (c.voteCount || 0), 0);
  
  const candidateStats = candidates.map(candidate => {
    const votes = candidate.voteCount || 0;
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
    
    return {
      id: candidate._id,
      name: candidate.name,
      votes,
      percentage: Math.round(percentage * 10) / 10,
      trend: calculateTrend(candidate),
    };
  });

  // Sort by votes
  candidateStats.sort((a, b) => b.votes - a.votes);

  // Calculate winner
  const winner = candidateStats.length > 0 ? candidateStats[0] : null;
  const isClose = winner && candidateStats.length > 1 && 
    (winner.votes - candidateStats[1].votes) <= Math.ceil(totalVotes * 0.05);

  return {
    totalVotes,
    totalVoters: voters.length,
    candidates: candidateStats,
    winner,
    isCloseRace: isClose,
    participationRate: calculateParticipationRate(voters.length),
    votingVelocity: calculateVotingVelocity(voters),
  };
}

function calculateTrend(candidate) {
  // Simple trend calculation based on vote count
  const votes = candidate.voteCount || 0;
  if (votes === 0) return 'stable';
  return votes > 0 ? 'up' : 'stable';
}

function calculateParticipationRate(voterCount) {
  // Assuming there might be more eligible voters
  // This is a placeholder - you can customize based on your needs
  return voterCount > 0 ? 'High' : 'Low';
}

function calculateVotingVelocity(voters) {
  if (voters.length === 0) return 0;
  
  const now = new Date();
  const recentVotes = voters.filter(v => {
    const voteTime = new Date(v.updatedAt);
    const hoursDiff = (now - voteTime) / (1000 * 60 * 60);
    return hoursDiff <= 1;
  });

  return recentVotes.length;
}

export function getVoteDistribution(candidates) {
  const total = candidates.reduce((acc, c) => acc + (c.voteCount || 0), 0);
  
  return candidates.map(c => ({
    name: c.name,
    value: c.voteCount || 0,
    percentage: total > 0 ? ((c.voteCount || 0) / total) * 100 : 0,
  }));
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return 'Just now';
}
