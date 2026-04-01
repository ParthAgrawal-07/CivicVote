// frontend/src/hooks/useElections.js
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchElections = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/elections');
      setElections(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load elections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchElections(); }, [fetchElections]);

  const castVote = useCallback(async (electionId, candidateId) => {
    const { data } = await api.post(`/elections/${electionId}/vote`, { candidateId });
    // Optimistically update local state
    setElections(prev =>
      prev.map(e => {
        if (e.id !== electionId) return e;
        return {
          ...e,
          votedCandidateId: candidateId,
          totalVotes: e.totalVotes + 1,
          candidates: e.candidates.map(c =>
            c.id === candidateId ? { ...c, _voteCount: (c._voteCount || 0) + 1 } : c
          ),
        };
      })
    );
    return data;
  }, []);

  return { elections, loading, error, refetch: fetchElections, castVote };
}
