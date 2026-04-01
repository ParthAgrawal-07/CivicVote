// frontend/src/pages/AdminPage.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { toast } from '../components/Toast';
import { CATEGORIES, AVATAR_COLORS, BAR_COLORS, LOG_TYPE_STYLES } from '../utils/constants';

// ── Feather icon (inline, no dep)
function Icon({ d, size = 16, color = 'currentColor', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  grid:    'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  list:    'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  users:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  filter:  'M4 6h16M7 12h10M10 18h4',
  log:     'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  shield:  'M12 1L3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5L12 1z',
  plus:    'M12 5v14M5 12h14',
  trash:   'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  edit:    'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  check:   'M20 6L9 17l-5-5',
  alert:   'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  clock:   'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2',
};

const SIDEBAR = [
  { id: 'dashboard',   label: 'Dashboard',        icon: 'grid',   section: 'Overview' },
  { id: 'manage',      label: 'Manage Elections',  icon: 'list',   section: 'Elections' },
  { id: 'candidates',  label: 'Candidates',        icon: 'users',  section: 'Elections' },
  { id: 'eligibility', label: 'Voter Eligibility', icon: 'filter', section: 'Elections' },
  { id: 'audit',       label: 'Audit Log',         icon: 'log',    section: 'Security' },
];

export default function AdminPage() {
  const { user, logout } = useAuth();
  const admin            = useAdmin();
  const [panel, setPanel] = useState('dashboard');

  // ── Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [showAddCand, setShowAddCand] = useState(false);
  const [candElection, setCandElection] = useState('');

  return (
    <div className="min-h-screen bg-paper-2">

      {/* ── Nav */}
      <nav className="h-[54px] flex items-center justify-between px-6 bg-paper border-b border-black/10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Icon d={ICONS.shield} size={14} color="white" />
          </div>
          <span className="font-serif text-lg tracking-tight">CivicVote</span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-ink-3 border border-black/15 px-2 py-0.5 rounded-full ml-1">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-ink-2">
            <div className="w-6 h-6 rounded-full bg-accent-light text-accent font-bold text-[11px] flex items-center justify-center">
              {user?.name?.[0] || 'A'}
            </div>
            <span className="hidden sm:inline">{user?.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cvgreen bg-cvgreen-light px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-cvgreen" />Secured
          </div>
          <button className="btn-secondary text-xs px-3 py-1.5" onClick={logout}>Sign out</button>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-54px)]">

        {/* ── Sidebar */}
        <aside className="w-52 flex-shrink-0 bg-paper border-r border-black/10 p-3.5 sticky top-[54px] h-[calc(100vh-54px)] overflow-y-auto">
          {['Overview','Elections','Security'].map(section => {
            const items = SIDEBAR.filter(s => s.section === section);
            return (
              <div key={section}>
                <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-ink-4 px-2.5 pt-4 pb-1.5 first:pt-1">{section}</p>
                {items.map(item => (
                  <button key={item.id}
                    onClick={() => setPanel(item.id)}
                    className={`sidebar-item ${panel === item.id ? 'active' : ''}`}>
                    <Icon d={ICONS[item.icon]} size={15} color="currentColor" />
                    {item.label}
                  </button>
                ))}
              </div>
            );
          })}
        </aside>

        {/* ── Main */}
        <main className="flex-1 p-7 overflow-y-auto">

          {/* DASHBOARD */}
          {panel === 'dashboard' && (
            <div>
              {admin.loading ? <Spinner /> : (
                <>
                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-3.5 mb-7">
                    {[
                      { label: 'Registered Voters', val: admin.dashboard?.metrics.totalVoters ?? '—', sub: 'Enrolled students' },
                      { label: 'Ballots Cast',       val: admin.dashboard?.metrics.totalBallots ?? '—', sub: 'This cycle' },
                      { label: 'Turnout Rate',       val: admin.dashboard?.metrics.turnout != null ? admin.dashboard.metrics.turnout + '%' : '—', sub: 'Of eligible voters' },
                      { label: 'Active Elections',   val: admin.dashboard?.metrics.activeElections ?? '—', sub: 'Currently open' },
                    ].map(m => (
                      <div key={m.label} className="metric-card">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-3 mb-2">{m.label}</div>
                        <div className="font-serif text-3xl text-ink leading-none">{m.val}</div>
                        <div className="text-xs text-ink-4 mt-1.5">{m.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Results */}
                  <h3 className="font-serif text-xl font-normal mb-1">Live Results</h3>
                  <p className="text-sm text-ink-3 mb-4">Real-time vote counts across all elections.</p>
                  <div className="space-y-4">
                    {(admin.dashboard?.elections || []).map(e => <ResultCard key={e.id} election={e} />)}
                  </div>
                </>
              )}
            </div>
          )}

          {/* MANAGE ELECTIONS */}
          {panel === 'manage' && (
            <div>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-serif text-xl font-normal mb-1">Elections</h3>
                  <p className="text-sm text-ink-3">Create, edit, and control ballot access.</p>
                </div>
                <button className="btn-primary text-sm" onClick={() => setShowCreate(true)}>
                  <Icon d={ICONS.plus} size={14} color="white" />New election
                </button>
              </div>

              <div className="card overflow-hidden">
                <div className="table-row table-header" style={{ gridTemplateColumns: '2fr 1.2fr 80px 80px 110px' }}>
                  <div>Election</div><div>Category</div><div>Votes</div><div>Status</div><div>Actions</div>
                </div>
                {(admin.dashboard?.elections || []).map(e => (
                  <div key={e.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.2fr 80px 80px 110px' }}>
                    <div>
                      <div className="text-sm font-semibold text-ink">{e.title}</div>
                      <div className="text-xs text-ink-3 mt-0.5">{e.eligible}</div>
                    </div>
                    <div className="text-xs text-ink-2">{CATEGORIES[e.category]}</div>
                    <div className="text-sm text-ink-2">{e.totalVotes}</div>
                    <div><span className="pill-live">Live</span></div>
                    <div className="flex gap-2">
                      <IconBtn icon="edit" title="Edit (coming soon)" onClick={() => toast('Edit in Cursor — see CURSOR_PROMPT.md')} />
                      <IconBtn icon="trash" title="Delete" danger onClick={async () => {
                        if (!confirm(`Delete "${e.title}"?`)) return;
                        try { await admin.deleteElection(e.id); toast('Election deleted.', 'red'); }
                        catch { toast('Failed to delete.', 'red'); }
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CANDIDATES */}
          {panel === 'candidates' && (
            <div>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-serif text-xl font-normal mb-1">Candidates</h3>
                  <p className="text-sm text-ink-3">Add or remove candidates from any election.</p>
                </div>
                <button className="btn-primary text-sm" onClick={() => setShowAddCand(true)}>
                  <Icon d={ICONS.plus} size={14} color="white" />Add candidate
                </button>
              </div>

              <div className="card overflow-hidden">
                <div className="table-row table-header" style={{ gridTemplateColumns: '2fr 1.5fr 80px 80px' }}>
                  <div>Candidate</div><div>Election</div><div>Votes</div><div>Actions</div>
                </div>
                {(admin.dashboard?.elections || []).flatMap((e, ei) =>
                  e.candidates.map((c, ci) => {
                    const av = AVATAR_COLORS[(ci + ei) % AVATAR_COLORS.length];
                    return (
                      <div key={c.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr 80px 80px' }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                            style={{ background: av.bg, color: av.text }}>
                            {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-ink">{c.name}</div>
                            <div className="text-xs text-ink-3">{c.role}</div>
                          </div>
                        </div>
                        <div className="text-xs text-ink-2">{e.title}</div>
                        <div className="text-sm text-ink-2">{c.votes}</div>
                        <div>
                          <IconBtn icon="trash" danger title="Remove candidate" onClick={async () => {
                            if (!confirm(`Remove ${c.name} from "${e.title}"?`)) return;
                            try { await admin.removeCandidate(e.id, c.id); toast(`${c.name} removed.`, 'red'); }
                            catch { toast('Failed to remove.', 'red'); }
                          }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ELIGIBILITY */}
          {panel === 'eligibility' && (
            <div>
              <h3 className="font-serif text-xl font-normal mb-1">Voter Eligibility</h3>
              <p className="text-sm text-ink-3 mb-5">Control which students can vote in each election.</p>
              <div className="space-y-4">
                {(admin.dashboard?.elections || []).map(e => (
                  <div key={e.id} className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-semibold text-sm">{e.title}</div>
                      <span className="pill-live">Live</span>
                    </div>
                    <div className="divide-y divide-black/[0.07] text-sm">
                      {[
                        { label: 'Eligible voters', val: e.eligible },
                        { label: 'Anonymous voting', val: 'Yes (recommended)', toggle: true, on: true },
                        { label: 'Allow write-in candidates', val: '', toggle: true, on: false },
                        { label: 'Show live results to voters', val: '', toggle: true, on: false },
                        { label: 'Registered candidates', val: e.candidates.length },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between py-2.5">
                          <span className="text-ink-2">{row.label}</span>
                          {row.toggle
                            ? <Toggle defaultOn={row.on} onChange={() => toast('Eligibility updated.')} />
                            : <span className="font-medium text-ink">{row.val}</span>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT LOG */}
          {panel === 'audit' && (
            <div>
              <h3 className="font-serif text-xl font-normal mb-1">Audit Log</h3>
              <p className="text-sm text-ink-3 mb-5">
                All system events are recorded with timestamps. Votes are anonymous — identities are never linked to choices.
              </p>
              <div className="space-y-0.5">
                {(admin.audit || []).map((log, i) => {
                  const style = LOG_TYPE_STYLES[log.type] || LOG_TYPE_STYLES.SYS;
                  const iconD = log.type === 'VOTE' ? ICONS.check : log.type === 'ADMIN' ? ICONS.shield : log.type === 'WARN' ? ICONS.alert : ICONS.clock;
                  return (
                    <div key={i} className="flex items-start gap-3.5 px-3 py-2.5 rounded-cv hover:bg-paper-2 transition-colors">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: style.bg }}>
                        <Icon d={iconD} size={12} color={style.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink">{log.message}</div>
                        <div className="text-xs text-ink-3 mt-0.5 truncate">{log.detail}</div>
                      </div>
                      <div className="text-xs text-ink-4 flex-shrink-0 mt-0.5 tabular-nums">
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Create Election Modal */}
      {showCreate && (
        <CreateElectionModal
          onClose={() => setShowCreate(false)}
          onCreate={async (payload) => {
            try {
              await admin.createElection(payload);
              setShowCreate(false);
              toast(`Election "${payload.title}" is now live!`);
            } catch (err) {
              toast(err.response?.data?.error || 'Failed to create election.', 'red');
            }
          }}
        />
      )}

      {/* ── Add Candidate Modal */}
      {showAddCand && (
        <AddCandidateModal
          elections={admin.dashboard?.elections || []}
          onClose={() => setShowAddCand(false)}
          onAdd={async (electionId, payload) => {
            try {
              await admin.addCandidate(electionId, payload);
              setShowAddCand(false);
              toast('Candidate added.');
            } catch (err) {
              toast(err.response?.data?.error || 'Failed to add candidate.', 'red');
            }
          }}
        />
      )}
    </div>
  );
}

// ── Sub-components

function ResultCard({ election }) {
  const total = election.totalVotes;
  const maxV  = Math.max(...election.candidates.map(c => c.votes), 1);

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-black/[0.07] flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm">{election.title}</div>
          <div className="text-xs text-ink-3 mt-0.5">{total} votes · {CATEGORIES[election.category]}</div>
        </div>
        <span className="pill-live">Live</span>
      </div>
      <div className="px-5 py-4 space-y-3">
        {election.candidates.map((c, i) => {
          const pct = total > 0 ? Math.round((c.votes / total) * 100) : 0;
          const leading = c.votes === maxV && maxV > 0;
          const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <div key={c.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: av.bg, color: av.text }}>
                    {c.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                  </div>
                  {c.name}
                  {leading && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cvgold-light text-cvgold">Leading</span>}
                </div>
                <span className="text-xs text-ink-2 tabular-nums">{c.votes} · {pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-paper-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IconBtn({ icon, onClick, danger, title }) {
  return (
    <button title={title} onClick={onClick}
      className={`w-7 h-7 rounded-md border border-black/15 flex items-center justify-center cursor-pointer transition-all
        ${danger ? 'hover:bg-cvred-light hover:border-cvred/30 hover:text-cvred' : 'hover:bg-paper-2'}
        bg-transparent text-ink-2`}>
      <Icon d={ICONS[icon]} size={13} color="currentColor" />
    </button>
  );
}

function Toggle({ defaultOn, onChange }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => { setOn(v => !v); onChange(!on); }}
      className="w-9 h-5 rounded-full relative border-none cursor-pointer transition-colors duration-200 flex-shrink-0"
      style={{ background: on ? '#1d7a4f' : '#e8e7e1' }}>
      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: on ? '19px' : '2px' }} />
    </button>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Modal({ title, sub, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-5"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-cv-lg p-7 w-full max-w-lg shadow-cv-lg max-h-[90vh] overflow-y-auto">
        <h3 className="font-serif text-xl font-normal mb-1">{title}</h3>
        <p className="text-sm text-ink-3 mb-5">{sub}</p>
        {children}
      </div>
    </div>
  );
}

function CreateElectionModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', category: 'PRESIDENT_VP', eligibleGroup: 'ALL',
    startsAt: '', endsAt: '', candidates: '',
    anonymous: true, allowWriteIn: false, showLive: false,
  });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.startsAt || !form.endsAt) {
      toast('Please fill in required fields.', 'red'); return;
    }
    setLoading(true);
    const candidates = form.candidates.split(',').map(s => s.trim()).filter(Boolean)
      .map(s => ({ name: s.replace(/\(.*\)/, '').trim(), role: s.match(/\(([^)]+)\)/)?.[1] || '' }));
    await onCreate({
      ...form,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      candidates,
    });
    setLoading(false);
  };

  return (
    <Modal title="Create new election" sub="Configure and publish a ballot for eligible students." onClose={onClose}>
      <div className="space-y-3.5">
        <div>
          <label className="field-label">Election title *</label>
          <input className="field-input" placeholder="Student Body President 2025" value={form.title} onChange={set('title')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Category *</label>
            <select className="field-input" value={form.category} onChange={set('category')}>
              <option value="PRESIDENT_VP">Student President / VP</option>
              <option value="CLUB_HEAD">Club / Committee Heads</option>
              <option value="CLASS_REP">Class Representatives</option>
            </select>
          </div>
          <div>
            <label className="field-label">Eligible voters</label>
            <select className="field-input" value={form.eligibleGroup} onChange={set('eligibleGroup')}>
              {['ALL','Year 1 only','Year 2 only','Year 3 only','Year 4 only','Engineering dept','Science dept','Management dept']
                .map(v => <option key={v} value={v}>{v === 'ALL' ? 'All students' : v}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Start date *</label>
            <input type="datetime-local" className="field-input" value={form.startsAt} onChange={set('startsAt')} />
          </div>
          <div>
            <label className="field-label">End date *</label>
            <input type="datetime-local" className="field-input" value={form.endsAt} onChange={set('endsAt')} />
          </div>
        </div>
        <div>
          <label className="field-label">Candidates (comma-separated)</label>
          <textarea className="field-input resize-y min-h-[72px]"
            placeholder="Alex Patel (Year 3 CS), Jordan Smith (Year 2 BBA)"
            value={form.candidates} onChange={set('candidates')} />
        </div>
        <div className="flex justify-end gap-2.5 pt-2 border-t border-black/10">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Publishing...' : 'Publish election'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AddCandidateModal({ elections, onClose, onAdd }) {
  const [electionId, setElectionId] = useState(elections[0]?.id || '');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !electionId) { toast('Please fill in required fields.', 'red'); return; }
    setLoading(true);
    await onAdd(electionId, { name, role });
    setLoading(false);
  };

  return (
    <Modal title="Add candidate" sub="Add a new candidate to an existing election." onClose={onClose}>
      <div className="space-y-3.5">
        <div>
          <label className="field-label">Election *</label>
          <select className="field-input" value={electionId} onChange={e => setElectionId(e.target.value)}>
            {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Full name *</label>
            <input className="field-input" placeholder="Priya Nair" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Year / Department</label>
            <input className="field-input" placeholder="Year 3, Computer Science" value={role} onChange={e => setRole(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2.5 pt-2 border-t border-black/10">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add candidate'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
