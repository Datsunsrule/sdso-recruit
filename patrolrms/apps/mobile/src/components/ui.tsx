import React, { useState, useRef, useCallback } from 'react';

// ── Btn ──────────────────────────────────────────────────────────────────────
interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'ghost' | 'dark';
  fullWidth?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export function Btn({ children, onClick, variant = 'default', fullWidth, disabled, small, style, type = 'button' }: BtnProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const size = small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm';
  const variants: Record<string, string> = {
    default: 'bg-surfaceAlt border border-border text-text hover:bg-border',
    primary: 'bg-accent text-white hover:bg-accentHov shadow-[0_2px_8px_rgba(200,118,10,0.35)]',
    danger: 'bg-danger text-white hover:bg-red-700',
    ghost: 'bg-transparent border border-border text-textSub hover:bg-surfaceAlt',
    dark: 'bg-[#1a1a2e] text-white hover:bg-[#2d2d45]',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`${base} ${size} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
}

// ── TopBar ───────────────────────────────────────────────────────────────────
interface TopBarProps {
  title: string;
  icon?: string;
  onHome?: () => void;
  onBack?: () => void;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

export function TopBar({ title, icon, onHome, onBack, subtitle, rightContent }: TopBarProps) {
  return (
    <div className="flex items-center bg-black text-white px-4 py-3 gap-3 shrink-0" style={{ minHeight: 54 }}>
      {onBack && (
        <button onClick={onBack} className="text-white opacity-80 hover:opacity-100 mr-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      {icon && <span className="text-lg">{icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate">{title}</div>
        {subtitle && <div className="text-xs opacity-60 truncate">{subtitle}</div>}
      </div>
      {onHome && (
        <button onClick={onHome} className="text-white opacity-70 hover:opacity-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        </button>
      )}
      {rightContent}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={`bg-white rounded-card shadow-sm border border-border ${className}`} style={style}>
      {children}
    </div>
  );
}

// ── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ title }: { title: string }) {
  return (
    <div className="text-[11px] font-bold tracking-widest uppercase text-textSub pt-4 pb-1 border-b border-border mb-3">
      {title}
    </div>
  );
}

// ── FieldRow ──────────────────────────────────────────────────────────────────
export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <span className="text-xs font-semibold text-textSub w-32 shrink-0 pt-1">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ── Fld ───────────────────────────────────────────────────────────────────────
export function Fld({ label, children, span }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={span ? `col-span-${span}` : ''}>
      <label className="block text-[11px] font-bold tracking-wider uppercase text-textSub mb-1">{label}</label>
      {children}
    </div>
  );
}

// ── Input / Select / Textarea base styles ────────────────────────────────────
export const inputCls = 'w-full bg-surfaceAlt border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-borderFocus focus:ring-1 focus:ring-borderFocus/30 transition-colors';
export const selectCls = inputCls + ' appearance-none';

// ── StatusFooter ─────────────────────────────────────────────────────────────
export function StatusFooter({ userId, screen, location }: { userId?: string; screen?: string; location?: string }) {
  return (
    <div className="flex items-center justify-between bg-black text-white text-[10px] px-4 py-1.5 shrink-0">
      <span className="opacity-50">{userId || '—'}</span>
      <span className="opacity-50">{screen || '—'}</span>
      <span className="opacity-50">{location || '—'}</span>
    </div>
  );
}

// ── MicIcon ───────────────────────────────────────────────────────────────────
export function MicIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill={active ? '#c8760a' : 'none'}
      stroke={active ? '#c8760a' : 'currentColor'}
      strokeWidth="2"
      className={active ? 'mic-active' : ''}
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

// ── SpeechTextarea ────────────────────────────────────────────────────────────
interface SpeechTextareaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  minHeight?: number;
  label?: string;
}

export function SpeechTextarea({ value, onChange, placeholder, rows = 4, minHeight = 130, label }: SpeechTextareaProps) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const startDictation = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) { alert('Speech recognition not supported in this browser.'); return; }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';
    recRef.current = rec;

    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join(' ');
      onChange(value ? `${value} ${transcript}` : transcript);
    };

    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    rec.start();
    setListening(true);
  }, [value, onChange]);

  const stopDictation = () => {
    recRef.current?.stop();
    setListening(false);
  };

  return (
    <div>
      {label && <label className="block text-[11px] font-bold tracking-wider uppercase text-textSub mb-1">{label}</label>}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${inputCls} resize-y`}
          style={{ minHeight }}
        />
        <button
          type="button"
          onClick={listening ? stopDictation : startDictation}
          className={`absolute bottom-2 right-2 flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition-colors ${
            listening
              ? 'bg-accent/10 border-accent text-accent'
              : 'bg-surfaceAlt border-border text-textSub hover:border-accent hover:text-accent'
          }`}
        >
          <MicIcon active={listening} />
          {listening ? 'Stop' : 'Dictate'}
        </button>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
interface ToastProps { message: string; type?: 'success' | 'error' | 'info'; }
export function Toast({ message, type = 'info' }: ToastProps) {
  const colors = { success: 'bg-success text-white', error: 'bg-danger text-white', info: 'bg-[#1a1a2e] text-white' };
  return (
    <div className={`fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg shadow-md text-sm font-medium ${colors[type]}`}>
      {message}
    </div>
  );
}

// ── TabBar ────────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex border-b border-border bg-white shrink-0 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
            active === tab
              ? 'border-accent text-accent'
              : 'border-transparent text-textSub hover:text-text'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ── OfflineBanner ─────────────────────────────────────────────────────────────
export function OfflineBanner() {
  return (
    <div className="flex items-center gap-2 bg-warningLight border-b border-warning/30 px-4 py-2 text-xs text-warning font-semibold shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      Offline — changes saved locally
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base">{title}</h3>
          <button onClick={onClose} className="text-textMuted hover:text-text p-1">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: 'bg-accentLight text-accent',
    Active: 'bg-warningLight text-warning',
    Closed: 'bg-border text-textSub',
    Draft: 'bg-border text-textSub',
    Pending: 'bg-warningLight text-warning',
    Approved: 'bg-successLight text-success',
    Rejected: 'bg-dangerLight text-danger',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${map[status] || 'bg-border text-textSub'}`}>
      {status}
    </span>
  );
}

// ── PriorityBar ───────────────────────────────────────────────────────────────
export function PriorityBar({ priority }: { priority: string }) {
  const colors: Record<string, string> = { High: '#dc2626', Med: '#d97706', Low: '#16a34a' };
  return <div className="w-1 rounded-full self-stretch" style={{ background: colors[priority] || '#9ca3af' }} />;
}

// ── Geodesic SVG Logo ──────────────────────────────────────────────────────────
export function PatrolLogo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="28" fill="#000" />
      <polygon points="28,4 50,16 50,40 28,52 6,40 6,16" fill="none" stroke="#c8760a" strokeWidth="1.5" />
      <line x1="28" y1="4" x2="28" y2="52" stroke="#c8760a" strokeWidth="0.8" opacity="0.6" />
      <line x1="6" y1="16" x2="50" y2="40" stroke="#c8760a" strokeWidth="0.8" opacity="0.6" />
      <line x1="50" y1="16" x2="6" y2="40" stroke="#c8760a" strokeWidth="0.8" opacity="0.6" />
      <circle cx="28" cy="28" r="6" fill="none" stroke="#c8760a" strokeWidth="1.5" />
      <circle cx="28" cy="28" r="2" fill="#c8760a" />
    </svg>
  );
}

// ── MultiSelect chip picker ───────────────────────────────────────────────────
export function MultiSelect({ options, value, onChange, placeholder }: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((v) => (
          <span key={v} className="flex items-center gap-1 bg-accentLight text-accent text-xs font-semibold px-2 py-1 rounded-full">
            {v}
            <button onClick={() => toggle(v)} className="ml-0.5 text-accent/70 hover:text-accent">✕</button>
          </span>
        ))}
        {value.length === 0 && <span className="text-textMuted text-xs">{placeholder || 'None selected'}</span>}
      </div>
      <div className="flex flex-wrap gap-1">
        {options.filter((o) => !value.includes(o)).map((opt) => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className="text-xs px-2 py-1 rounded-full border border-border text-textSub hover:border-accent hover:text-accent transition-colors">
            + {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
