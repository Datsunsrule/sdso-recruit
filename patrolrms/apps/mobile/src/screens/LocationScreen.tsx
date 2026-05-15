import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { locationsApi, adminApi, authApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import type { Location } from '../types';

type AdminTab = 'Users' | 'Statistics' | 'Reports';

export default function LocationScreen() {
  const navigate = useNavigate();
  const { user, currentLocation, setCurrentLocation } = useAuthStore();
  const [mainTab, setMainTab] = useState<'Location' | 'Administration'>('Location');
  const [adminTab, setAdminTab] = useState<AdminTab>('Users');
  const [selected, setSelected] = useState<Location | null>(currentLocation);

  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: locationsApi.list });
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: adminApi.users, enabled: mainTab === 'Administration' && adminTab === 'Users' });
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.stats, enabled: mainTab === 'Administration' && adminTab === 'Statistics' });

  async function handleGo() {
    if (!selected) return;
    await authApi.updateMe({ current_location_id: selected.id });
    setCurrentLocation(selected);
    navigate('/cases');
  }

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden"
      style={{ backgroundImage: `url('/bronco-bg.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="px-4 pt-8 pb-4">
          <h1 className="text-white text-xl font-bold">PatrolRMS</h1>
          <p className="text-white/60 text-sm">{user?.full_name} · {user?.rank}</p>
        </div>

        {/* Tab strip */}
        <div className="flex mx-4 mb-3 rounded-xl overflow-hidden border border-white/20" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {(['Location', 'Administration'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className={`flex-1 py-2.5 text-sm font-bold transition-colors ${mainTab === tab ? 'bg-accent text-white' : 'text-white/60 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 gap-2 flex flex-col">
          {mainTab === 'Location' ? (
            <>
              {locations.map((loc: Location) => (
                <button
                  key={loc.id}
                  onClick={() => setSelected(loc)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: selected?.id === loc.id ? 'rgba(200,118,10,0.85)' : 'rgba(0,0,0,0.38)',
                    backdropFilter: 'blur(4px)',
                    border: selected?.id === loc.id ? '1px solid #c8760a' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">{loc.label}</div>
                    <div className="text-white/50 text-xs">{loc.code} · {loc.type}</div>
                  </div>
                  {loc.id === user?.default_location && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                      Your Station
                    </span>
                  )}
                  {selected?.id === loc.id && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                </button>
              ))}
            </>
          ) : (
            <>
              {/* Admin sub-tabs */}
              <div className="flex gap-2 mb-2">
                {(['Users', 'Statistics', 'Reports'] as AdminTab[]).map((t) => (
                  <button key={t} onClick={() => setAdminTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${adminTab === t ? 'bg-accent text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}>
                    {t}
                  </button>
                ))}
              </div>

              {adminTab === 'Users' && (
                <div className="flex flex-col gap-2">
                  {users.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-white font-bold text-sm">
                        {u.full_name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-semibold">{u.full_name}</div>
                        <div className="text-white/50 text-xs">{u.badge_number} · {u.rank}</div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${u.active ? 'bg-successLight text-success' : 'bg-dangerLight text-danger'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'Statistics' && stats && (
                <div className="grid grid-cols-2 gap-3">
                  {stats.reports_by_type?.map((r: any) => (
                    <div key={r.report_type} className="px-4 py-3 rounded-xl text-center"
                      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="text-accent text-2xl font-bold">{r.count}</div>
                      <div className="text-white/60 text-xs capitalize">{r.report_type}</div>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === 'Reports' && stats && (
                <div className="flex flex-col gap-2">
                  {stats.recent_activity?.slice(0, 20).map((a: any) => (
                    <div key={a.id} className="px-4 py-2 rounded-xl"
                      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-white text-xs font-semibold">{a.action} · {a.resource}</div>
                      <div className="text-white/40 text-[10px]">{new Date(a.occurred_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {mainTab === 'Location' && (
          <div className="px-4 pb-6 pt-2">
            <button
              onClick={handleGo}
              disabled={!selected}
              className="w-full py-3.5 rounded-xl font-bold text-white text-base disabled:opacity-40 transition-all"
              style={{ background: selected ? '#c8760a' : '#555', boxShadow: selected ? '0 4px 16px rgba(200,118,10,0.4)' : 'none' }}
            >
              Go →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
