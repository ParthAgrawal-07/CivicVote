// frontend/src/pages/VoterPage.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useElections } from '../hooks/useElections';
import { toast } from '../components/Toast';
import { CATEGORIES, CATEGORY_FILTERS, AVATAR_COLORS } from '../utils/constants';

export default function VoterPage() {
  const { user, logout }                    = useAuth();
  const { elections, loading, error, castVote } = useElections();
  const [filter, setFilter]                 = useState('all');
  const [selected, setSelected]             = useState({}); // { electionId: candidateId }
  const [voting, setVoting]                 = useState({}); // { electionId: bool }

  const visible = filter === 'all'
    ? elections
    : elections.filter(e => e.category === filter);

  const handleSelect = (electionId, candidateId) => {
    if (elections.find(e => e.id === electionId)?.votedCandidateId) return;
    setSelected(s => ({ ...s, [electionId]: candidateId }));
  };

  const handleVote = async (electionId) => {
    const candidateId = selected[electionId];
    if (!candidateId) return;
    setVoting(v => ({ ...v, [electionId]: true }));
    try {
      await castVote(electionId, candidateId);
      toast('Your ballot has been recorded anonymously and securely.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit vote.';
      toast(msg, 'red');
    } finally {
      setVoting(v => ({ ...v, [electionId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Nav */}
      <nav className="h-[54px] flex items-center justify-between px-6 bg-paper border-b border-black/10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5L12 1z"/>
            </svg>
          </div>
          <span className="font-serif text-lg tracking-tight">CivicVote</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-ink-2">
            <div className="w-6 h-6 rounded-full bg-accent-light text-accent font-bold text-[11px] flex items-center justify-center">
              {user?.name?.[0] || 'S'}
            </div>
            <span className="hidden sm:inline">{user?.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cvgreen bg-cvgreen-light px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-cvgreen" />
            Secured
          </div>
          <button className="btn-secondary text-xs px-3 py-1.5" onClick={logout}>Sign out</button>
        </div>
      </nav>

      <div className="max-w-[680px] mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-7">
          <h2 className="font-serif text-3xl font-normal mb-1">Active Elections</h2>
          <p className="text-sm text-ink-3">Select your candidate and submit your ballot. Each election allows one vote.</p>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORY_FILTERS.map(cat => (
            <button key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer font-sans
                ${filter === cat.value
                  ? 'bg-accent text-white border-accent'
                  : 'bg-transparent text-ink-2 border-black/20 hover:bg-paper-2'}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <div className="flex flex-col items-center py-16 text-ink-3">
            <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm">Loading elections...</span>
          </div>
        )}

        {error && (
          <div className="card p-5 border-cvred/30 bg-cvred-light text-cvred text-sm">{error}</div>
        )}

        {/* Elections */}
        {!loading && !error && (
          <div className="space-y-5">
            {visible.length === 0 && (
              <div className="card p-10 text-center text-ink-3 text-sm">
                No elections in this category right now.
              </div>
            )}
            {visible.map(election => (
              <ElectionCard
                key={election.id}
                election={election}
                selectedId={selected[election.id]}
                isVoting={voting[election.id]}
                onSelect={(cid) => handleSelect(election.id, cid)}
                onVote={() => handleVote(election.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ElectionCard({ election, selectedId, isVoting, onSelect, onVote }) {
  const voted = !!election.votedCandidateId;

  return (
    <div className="card-hover">
      {/* Head */}
      <div className="px-5 py-4 border-b border-black/[0.07] flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl font-normal mb-1">{election.title}</h3>
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <span>{CATEGORIES[election.category]}</span>
            <span className="w-1 h-1 rounded-full bg-ink-4" />
            <span>{election.eligibleGroup}</span>
            <span className="w-1 h-1 rounded-full bg-ink-4" />
            <span>{election.candidates.length} candidates</span>
          </div>
        </div>
        <span className="pill-live flex-shrink-0">Live</span>
      </div>

      {/* Candidates */}
      <div className="px-5 py-3.5 space-y-2.5">
        {election.candidates.map((c, i) => {
          const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const isVoted = voted && election.votedCandidateId === c.id;
          const isOther = voted && election.votedCandidateId !== c.id;
          const isSelected = !voted && selectedId === c.id;

          return (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-cv border transition-all duration-150 select-none
                ${isOther ? 'opacity-50 cursor-default border-black/10' :
                  isVoted ? 'border-cvgreen bg-cvgreen-light cursor-default' :
                  isSelected ? 'border-accent bg-accent-light cursor-pointer' :
                  'border-black/10 cursor-pointer hover:border-accent-2 hover:bg-accent-light'}`}
            >
              {/* Radio */}
              <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${isSelected || isVoted ? 'border-accent' : 'border-black/25'}`}>
                {(isSelected || isVoted) && <div className="w-2 h-2 rounded-full bg-accent" />}
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: av.bg, color: av.text }}>
                {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink truncate">{c.name}</div>
                <div className="text-xs text-ink-3 truncate">{c.role}</div>
              </div>

              {/* Check */}
              {isVoted && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d7a4f" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-black/[0.07] bg-paper flex items-center justify-between rounded-b-cv-lg">
        {voted ? (
          <>
            <div className="flex items-center gap-2 text-xs font-semibold text-cvgreen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Ballot submitted — vote is anonymous
            </div>
            <span className="text-xs text-ink-4">{election.totalVotes} total votes</span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-xs text-ink-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cvgreen animate-pulse" />
              Closes in {election.endsAt ? new Date(election.endsAt).toLocaleDateString() : '—'}
            </div>
            <button
              className="btn-primary py-2 px-5 text-xs"
              disabled={!selectedId || isVoting}
              onClick={onVote}
            >
              {isVoting ? 'Submitting...' : 'Submit ballot'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
