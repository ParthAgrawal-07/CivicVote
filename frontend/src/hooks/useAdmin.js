// frontend/src/hooks/useAdmin.js
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useAdmin() {
  const [dashboard, setDashboard] = useState(null);
  const [audit, setAudit]         = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetchDashboard = useCallback(async () => {
    const { data } = await api.get('/admin/dashboard');
    setDashboard(data);
  }, []);

  const fetchAudit = useCallback(async () => {
    const { data } = await api.get('/admin/audit');
    setAudit(data.logs);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([fetchDashboard(), fetchAudit()]);
      } catch (err) {
        console.error('Admin data error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchDashboard, fetchAudit]);

  // Elections CRUD
  const createElection = useCallback(async (payload) => {
    const { data } = await api.post('/elections', payload);
    await fetchDashboard();
    return data;
  }, [fetchDashboard]);

  const updateElection = useCallback(async (id, payload) => {
    const { data } = await api.put(`/elections/${id}`, payload);
    await fetchDashboard();
    return data;
  }, [fetchDashboard]);

  const deleteElection = useCallback(async (id) => {
    await api.delete(`/elections/${id}`);
    await fetchDashboard();
  }, [fetchDashboard]);

  // Candidates CRUD
  const addCandidate = useCallback(async (electionId, payload) => {
    const { data } = await api.post(`/elections/${electionId}/candidates`, payload);
    await fetchDashboard();
    return data;
  }, [fetchDashboard]);

  const removeCandidate = useCallback(async (electionId, candidateId) => {
    await api.delete(`/elections/${electionId}/candidates/${candidateId}`);
    await fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard, audit, loading,
    refetchDashboard: fetchDashboard,
    refetchAudit: fetchAudit,
    createElection, updateElection, deleteElection,
    addCandidate, removeCandidate,
  };
}
