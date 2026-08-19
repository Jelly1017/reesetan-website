// src/components/crm/AdminDashboard.tsx
// The custom CRM view. Loads leads from props, supports filter / status change / notes / delete.

import { useState, useMemo } from 'react';
import type { Lead, LeadStatus } from '../../lib/validation';
import { LEAD_STATUSES } from '../../lib/validation';

interface Props {
  initialLeads: Lead[];
  adminEmail: string;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: '🆕 New',
  contacted: '📞 Contacted',
  qualified: '✅ Qualified',
  booked: '📅 Booked',
  completed: '🎓 Completed',
  lost: '❌ Lost',
  won: '💰 Won',
};

const SERVICE_LABELS: Record<Lead['service'], string> = {
  training: 'SME / Corporate Training',
  consultation: 'Hourly Consultation',
  strategy: 'Strategy Review',
};

export default function AdminDashboard({ initialLeads, adminEmail }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (filter !== 'all' && l.status !== filter) return false;
      if (search) {
        const s = search.toLowerCase();
        return l.name.toLowerCase().includes(s)
          || l.email.toLowerCase().includes(s)
          || l.phone.toLowerCase().includes(s)
          || l.goals.toLowerCase().includes(s);
      }
      return true;
    });
  }, [leads, filter, search]);

  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    LEAD_STATUSES.forEach(s => { byStatus[s] = 0; });
    leads.forEach(l => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; });
    return { total: leads.length, byStatus };
  }, [leads]);

  async function updateLead(id: string, updates: Partial<Lead>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const { lead } = await res.json();
        setLeads(ls => ls.map(l => l.id === id ? lead : l));
        setSelected(lead);
      } else {
        alert('Failed to save');
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteLead(id: string) {
    if (!confirm('Delete this lead permanently? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setLeads(ls => ls.filter(l => l.id !== id));
      setSelected(null);
    } else {
      alert('Failed to delete');
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  }

  async function exportCSV() {
    const res = await fetch('/api/admin/export');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Top bar */}
      <header style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
            Reese<span style={{ color: 'var(--primary)' }}>.</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin</span>
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{adminEmail}</span>
          <button onClick={exportCSV} className="btn btn--ghost btn--sm">📥 Export CSV</button>
          <button onClick={logout} className="btn btn--secondary btn--sm">Sign out</button>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 32 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total</div>
            <div className="text-mono" style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>{stats.total}</div>
          </div>
          {LEAD_STATUSES.map(s => (
            <div key={s} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{STATUS_LABELS[s]}</div>
              <div className="text-mono" style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{stats.byStatus[s] || 0}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search by name, email, phone, or goals…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ maxWidth: 400 }}
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="select"
            style={{ maxWidth: 200 }}
          >
            <option value="all">All statuses ({stats.total})</option>
            {LEAD_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]} ({stats.byStatus[s] || 0})</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--muted)', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Name</th>
                  <th style={{ padding: 12 }}>Service</th>
                  <th style={{ padding: 12 }}>Contact</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Created</th>
                  <th style={{ padding: 12 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--muted-foreground)' }}>
                      {search || filter !== 'all' ? 'No leads match your filters.' : 'No leads yet. Share your site to get started.'}
                    </td>
                  </tr>
                ) : filtered.map(l => (
                  <tr
                    key={l.id}
                    onClick={() => setSelected(l)}
                    style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                  >
                    <td style={{ padding: 12, fontWeight: 500 }}>{l.name}</td>
                    <td style={{ padding: 12, color: 'var(--muted-foreground)' }}>{SERVICE_LABELS[l.service]}</td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      <div>{l.email}</div>
                      <div style={{ color: 'var(--muted-foreground)' }}>{l.phone}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span className="badge badge--subtle">{STATUS_LABELS[l.status]}</span>
                    </td>
                    <td style={{ padding: 12, color: 'var(--muted-foreground)', fontSize: 13 }}>
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <a
                        href={`https://wa.me/${l.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${l.name}, thanks for your interest in ${SERVICE_LABELS[l.service]}!`)}`}
                        target="_blank"
                        rel="noopener"
                        onClick={e => e.stopPropagation()}
                        style={{ color: '#25D366', fontSize: 13, fontWeight: 500 }}
                      >
                        WhatsApp →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail drawer */}
      {selected && (
        <LeadDetail
          lead={selected}
          onClose={() => setSelected(null)}
          onSave={(updates) => updateLead(selected.id, updates)}
          onDelete={() => deleteLead(selected.id)}
          saving={saving}
        />
      )}
    </div>
  );
}

function LeadDetail({ lead, onClose, onSave, onDelete, saving }: {
  lead: Lead;
  onClose: () => void;
  onSave: (updates: Partial<Lead>) => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes || '');

  return (
    <div
      style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 500, background: 'var(--background)', borderLeft: '1px solid var(--border)', zIndex: 100, overflowY: 'auto', boxShadow: '-4px 0 20px oklch(0% 0 0 / 0.1)' }}
    >
      <div style={{ padding: 24, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--background)', zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>{lead.name}</h3>
        <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--muted-foreground)' }}>×</button>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Service" value={SERVICE_LABELS[lead.service]} />
        <Field label="Email">
          <a href={`mailto:${lead.email}`} style={{ color: 'var(--primary)' }}>{lead.email}</a>
        </Field>
        <Field label="Phone">
          <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" style={{ color: '#25D366' }}>{lead.phone}</a>
        </Field>
        {lead.team_size && <Field label="Team size" value={lead.team_size} />}
        <Field label="Goals" value={lead.goals} multiline />
        <Field label="Source" value={lead.source || 'website-form'} />
        <Field label="Locale" value={lead.locale.toUpperCase()} />
        <Field label="Created" value={new Date(lead.created_at).toLocaleString()} />

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

        <div>
          <label className="form-label">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as LeadStatus)} className="select">
            {LEAD_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Notes (private)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="textarea"
            rows={4}
            placeholder="e.g. Spoke 22 Aug. Wants to schedule in-house training for 12-person team in Oct."
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onSave({ status, notes })}
            disabled={saving}
            className="btn btn--primary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            onClick={onDelete}
            className="btn btn--secondary"
            style={{ color: 'var(--destructive)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, multiline, children }: { label: string; value?: string; multiline?: boolean; children?: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {children || (
        <div style={{ fontSize: 14, whiteSpace: multiline ? 'pre-wrap' : 'normal', lineHeight: 1.5 }}>
          {value}
        </div>
      )}
    </div>
  );
}
