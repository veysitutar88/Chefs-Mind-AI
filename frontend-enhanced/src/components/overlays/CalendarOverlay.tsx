'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — CalendarOverlay
   ========================================================= */

import React, { useState } from 'react';

interface CalendarOverlayProps { onClose: () => void; }

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDay(year: number, month: number)    { return new Date(year, month, 1).getDay(); }

export function CalendarOverlay({ onClose: _ }: CalendarOverlayProps) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected]   = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDay(viewYear, viewMonth);
  const todayStr    = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); } else setViewMonth(v => v - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); } else setViewMonth(v => v + 1); };

  /* Dummy events */
  const events: Record<string, string[]> = {
    [`${viewYear}-${viewMonth}-${today.getDate()}`]: ['Staff Briefing', 'Supplier Call'],
    [`${viewYear}-${viewMonth}-${today.getDate() + 2}`]: ['Menu Tasting'],
  };

  const cells = Array.from({ length: firstDay }, (_, i) => ({ day: null, key: `e${i}` }))
    .concat(Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, key: `d${i+1}` })));

  return (
    <div className="flex h-full overflow-hidden">
      {/* Calendar Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-xl transition-colors" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-xl transition-colors" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--text-disabled)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map(({ day, key }) => {
            if (!day) return <div key={key} />;
            const cellKey = `${viewYear}-${viewMonth}-${day}`;
            const isToday = cellKey === todayStr;
            const isSelected = cellKey === selected;
            const hasEvents = !!events[cellKey];

            return (
              <button
                key={key}
                onClick={() => setSelected(cellKey)}
                className="relative flex flex-col items-center justify-start py-2 rounded-xl transition-all"
                style={{
                  minHeight: 52,
                  background: isSelected ? 'var(--accent-subtle)' : isToday ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: `1px solid ${isSelected ? 'var(--border-accent)' : isToday ? 'var(--border-soft)' : 'transparent'}`,
                  boxShadow: isSelected ? '0 0 12px var(--accent-glow)' : 'none',
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: isSelected ? 'var(--accent)' : isToday ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {day}
                </span>
                {hasEvents && (
                  <div
                    className="mt-1"
                    style={{ width: 4, height: 4, borderRadius: 9999, background: 'var(--accent)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side panel: selected day events */}
      <div
        className="w-52 p-5 overflow-y-auto flex-shrink-0"
        style={{ borderLeft: '1px solid var(--border-subtle)' }}
      >
        <div className="text-xs font-semibold uppercase mb-4" style={{ color: 'var(--text-disabled)', letterSpacing: '0.08em' }}>
          {selected ? 'Events' : 'Select a day'}
        </div>
        {selected && (events[selected] || []).map((ev, i) => (
          <div
            key={i}
            className="mb-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)', color: 'var(--accent)' }}
          >
            {ev}
          </div>
        ))}
        {selected && !(events[selected] || []).length && (
          <div className="text-xs" style={{ color: 'var(--text-disabled)' }}>No events</div>
        )}
      </div>
    </div>
  );
}
