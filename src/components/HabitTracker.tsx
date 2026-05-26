'use client';

import { useEffect, useState } from 'react';

type Habit = {
  id: string;
  name: string;
  completions: string[];
};

const STORAGE_KEY = 'habit-tracker-v1';

// Neon glow presets — reused across components
const GLOW_TEAL_TEXT =
  '0 0 6px rgba(94, 234, 212, 0.8), 0 0 18px rgba(45, 212, 191, 0.5), 0 0 36px rgba(20, 184, 166, 0.25)';
const GLOW_TEAL_TEXT_SOFT =
  '0 0 6px rgba(94, 234, 212, 0.6), 0 0 14px rgba(45, 212, 191, 0.35)';
const GLOW_ROSE_TEXT =
  '0 0 6px rgba(253, 164, 175, 0.8), 0 0 18px rgba(251, 113, 133, 0.5), 0 0 36px rgba(244, 63, 94, 0.25)';
const GLOW_ROSE_TEXT_SOFT =
  '0 0 6px rgba(253, 164, 175, 0.6), 0 0 14px rgba(251, 113, 133, 0.35)';
const GLOW_TEAL_ICON =
  'drop-shadow(0 0 4px rgba(94, 234, 212, 0.8)) drop-shadow(0 0 10px rgba(45, 212, 191, 0.4))';
const GLOW_ROSE_ICON =
  'drop-shadow(0 0 4px rgba(253, 164, 175, 0.8)) drop-shadow(0 0 10px rgba(251, 113, 133, 0.4))';
const GLOW_PROGRESS_RING =
  'drop-shadow(0 0 4px rgba(45, 212, 191, 0.6)) drop-shadow(0 0 8px rgba(244, 63, 94, 0.4))';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function last7Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function weekProgress(completions: string[]): number {
  const week = last7Days();
  const done = week.filter((d) => completions.includes(d)).length;
  return Math.round((done / 7) * 100);
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { weekday: 'short' });
}

/* ---------- Stylized neon icons ---------- */

type IconProps = { className?: string; style?: React.CSSProperties };

function IconSparkle({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
      <path d="M19 4l.7 1.8L21.5 6.5l-1.8.7L19 9l-.7-1.8L16.5 6.5l1.8-.7L19 4z" />
      <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8L16.5 18.2l1.8-.7L19 15z" />
    </svg>
  );
}

function IconTrophy({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 7H5.5A2.5 2.5 0 0 0 8 10" />
      <path d="M17 7h1.5A2.5 2.5 0 0 1 16 10" />
      <path d="M12 14v4" />
      <path d="M8.5 21h7" />
      <path d="M9.5 18h5" />
    </svg>
  );
}

function IconSeedling({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M5 21h14" />
      <path d="M12 21V11" />
      <path d="M12 11C9 11 6.5 8.5 6.5 5.5 9.5 5.5 12 8 12 11z" />
      <path d="M12 14c3 0 5.5-2 5.5-5C14.5 9 12 11 12 14z" />
    </svg>
  );
}

function IconFlame({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M12 3c.8 3.5 4.5 4.5 4.5 9a4.5 4.5 0 1 1-9 0c0-2 1-3.2 2.2-4 .3 1.8 1.4 2.5 2.3 2.5C12 8.5 12 6 12 3z" />
    </svg>
  );
}

function IconCheck({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconReset({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconX({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function IconPlus({ className = '', style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function HabitAvatar({ name, id }: { name: string; id: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || '•';
  // Deterministic teal vs rose pick per habit (stable across reloads)
  const isTeal =
    (id.charCodeAt(0) + id.charCodeAt(Math.max(0, id.length - 1))) % 2 === 0;
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0 ${
        isTeal
          ? 'bg-gradient-to-br from-teal-300 to-teal-600'
          : 'bg-gradient-to-br from-rose-300 to-rose-600'
      }`}
      style={{
        boxShadow: isTeal
          ? '0 0 14px rgba(45, 212, 191, 0.55), inset 0 0 8px rgba(255,255,255,0.15)'
          : '0 0 14px rgba(244, 63, 94, 0.55), inset 0 0 8px rgba(255,255,255,0.15)',
      }}
      aria-hidden
    >
      {letter}
    </div>
  );
}

/* ---------- Main component ---------- */

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [input, setInput] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<Partial<Habit>>;
        const normalized: Habit[] = parsed
          .filter((h): h is Habit => !!h?.id && !!h?.name)
          .map((h) => ({
            id: h.id,
            name: h.name,
            completions: Array.isArray(h.completions) ? h.completions : [],
          }));
        setHabits(normalized);
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits, hydrated]);

  function addHabit(e: React.FormEvent) {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    setHabits((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, completions: [] },
    ]);
    setInput('');
  }

  function toggleToday(id: string) {
    const today = todayKey();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const done = h.completions.includes(today);
        return {
          ...h,
          completions: done
            ? h.completions.filter((d) => d !== today)
            : [...h.completions, today],
        };
      })
    );
  }

  function resetHabit(id: string) {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completions: [] } : h))
    );
  }

  function deleteHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }

  const today = todayKey();
  const overall =
    habits.length === 0
      ? 0
      : Math.round(
          habits.reduce((s, h) => s + weekProgress(h.completions), 0) /
            habits.length
        );
  const todayFormatted = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-[#0a0a14] px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Atmospheric corner glows */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.28) 0%, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.28) 0%, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
        aria-hidden
      />
      {/* Subtle grid overlay for "city sign" feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />

      <div className="relative max-w-2xl mx-auto">
        <header className="mb-8">
          <h1
            className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl text-teal-300 tracking-wide flex items-center gap-3"
            style={{ textShadow: GLOW_TEAL_TEXT }}
          >
            <IconSparkle
              className="w-8 h-8 sm:w-10 sm:h-10 shrink-0"
              style={{ filter: GLOW_TEAL_ICON }}
            />
            Трекер&nbsp;привычек
          </h1>
          <p className="text-slate-400 mt-3 capitalize text-sm font-mono tracking-wider">
            {todayFormatted}
          </p>
        </header>

        <Achievements progress={overall} habitCount={habits.length} />

        <form onSubmit={addHabit} className="mb-6 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Новая привычка..."
            maxLength={60}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950/50 backdrop-blur-sm border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/40 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-3 rounded-xl bg-teal-500/15 text-teal-200 border border-teal-400/50 font-medium hover:bg-teal-500/25 hover:border-teal-300 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:bg-teal-500/15 flex items-center gap-1.5"
            style={!input.trim() ? undefined : { boxShadow: '0 0 18px rgba(45,212,191,0.35)' }}
          >
            <IconPlus className="w-4 h-4" />
            Добавить
          </button>
        </form>

        {!hydrated ? null : habits.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <IconSeedling
              className="w-16 h-16 mx-auto mb-4 text-teal-300 animate-pulse"
              style={{ filter: GLOW_TEAL_ICON }}
            />
            <p>Добавьте первую привычку, чтобы зажечь вывеску.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                today={today}
                onToggle={() => toggleToday(h.id)}
                onReset={() => resetHabit(h.id)}
                onDelete={() => deleteHabit(h.id)}
              />
            ))}
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-slate-500 font-mono tracking-wider">
          Данные хранятся локально в браузере
        </footer>
      </div>
    </div>
  );
}

function Achievements({
  progress,
  habitCount,
}: {
  progress: number;
  habitCount: number;
}) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const status =
    habitCount === 0
      ? { text: 'Зажги вывеску', icon: null, glow: false }
      : progress >= 80
        ? {
            text: 'Отлично!',
            icon: (
              <IconFlame
                className="w-6 h-6 text-rose-300 shrink-0"
                style={{ filter: GLOW_ROSE_ICON }}
              />
            ),
            glow: true,
          }
        : progress >= 50
          ? { text: 'Хороший темп', icon: null, glow: false }
          : progress >= 20
            ? { text: 'Продолжайте', icon: null, glow: false }
            : { text: 'Только старт', icon: null, glow: false };

  return (
    <section
      className="mb-8 bg-slate-950/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 relative overflow-hidden"
      style={{ boxShadow: '0 0 60px rgba(244,63,94,0.07), inset 0 0 40px rgba(20,184,166,0.04)' }}
    >
      <h2
        className="font-[family-name:var(--font-display)] text-sm sm:text-base text-rose-300 tracking-[0.25em] mb-5 flex items-center gap-2.5"
        style={{ textShadow: GLOW_ROSE_TEXT_SOFT }}
      >
        <IconTrophy
          className="w-5 h-5 shrink-0"
          style={{ filter: GLOW_ROSE_ICON }}
        />
        МОИ ДОСТИЖЕНИЯ
      </h2>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg width="128" height="128" className="-rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="#1e293b"
              strokeWidth="9"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
              style={{ filter: GLOW_PROGRESS_RING }}
            />
            <defs>
              <linearGradient
                id="progressGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-3xl font-bold text-white font-mono"
              style={{ textShadow: '0 0 14px rgba(255,255,255,0.35)' }}
            >
              {progress}%
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
            за эту неделю
          </p>
          <p
            className="text-2xl font-bold mt-1.5 flex items-center gap-2 min-w-0 text-slate-100"
            style={status.glow ? { textShadow: GLOW_ROSE_TEXT_SOFT } : undefined}
          >
            <span className="truncate">{status.text}</span>
            {status.icon}
          </p>
          <p className="text-sm text-slate-500 mt-2 font-mono">
            {habitCount === 0
              ? 'привычек пока нет'
              : `${habitCount} ${pluralRu(habitCount, ['привычка', 'привычки', 'привычек'])}`}
          </p>
        </div>
      </div>
    </section>
  );
}

function HabitCard({
  habit,
  today,
  onToggle,
  onReset,
  onDelete,
}: {
  habit: Habit;
  today: string;
  onToggle: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const week = last7Days();
  const progress = weekProgress(habit.completions);
  const doneToday = habit.completions.includes(today);

  return (
    <div
      className={`bg-slate-950/40 backdrop-blur-sm rounded-2xl p-5 border transition-all duration-300 ${
        doneToday
          ? 'border-teal-400/50'
          : 'border-white/10 hover:border-white/25'
      }`}
      style={
        doneToday
          ? { boxShadow: '0 0 24px rgba(45,212,191,0.18), inset 0 0 24px rgba(45,212,191,0.04)' }
          : undefined
      }
    >
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <HabitAvatar name={habit.name} id={habit.id} />
          <h3 className="font-semibold text-slate-100 truncate">{habit.name}</h3>
        </div>
        <span className="text-sm font-mono font-medium text-slate-400 shrink-0">
          {progress}%
        </span>
      </div>

      <div className="mb-4">
        <div className="flex gap-1.5 mb-1.5">
          {week.map((d) => {
            const done = habit.completions.includes(d);
            const isToday = d === today;
            return (
              <div
                key={d}
                className={`
                  flex-1 h-2 rounded-full transition-all duration-500
                  ${done ? 'bg-gradient-to-r from-teal-400 to-rose-400' : 'bg-white/8'}
                  ${isToday && !done ? 'ring-1 ring-teal-300/60' : ''}
                `}
                style={
                  done
                    ? { boxShadow: '0 0 8px rgba(45,212,191,0.5), 0 0 4px rgba(244,63,94,0.4)' }
                    : undefined
                }
                title={d}
              />
            );
          })}
        </div>
        <div className="flex gap-1.5">
          {week.map((d) => (
            <div
              key={d}
              className={`flex-1 text-center text-[10px] uppercase tracking-widest font-mono ${
                d === today ? 'text-teal-300 font-semibold' : 'text-slate-500'
              }`}
              style={
                d === today
                  ? { textShadow: GLOW_TEAL_TEXT_SOFT }
                  : undefined
              }
            >
              {dayLabel(d)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onToggle}
          className={`
            flex-1 py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-95 border
            ${
              doneToday
                ? 'bg-teal-500/20 text-teal-200 border-teal-400/60 hover:bg-teal-500/30'
                : 'bg-white/5 text-slate-100 border-white/10 hover:bg-white/10 hover:border-white/25'
            }
          `}
          style={
            doneToday
              ? { boxShadow: '0 0 18px rgba(45,212,191,0.35)' }
              : undefined
          }
        >
          {doneToday ? (
            <span
              className="flex items-center justify-center gap-2"
              style={{ filter: GLOW_TEAL_ICON }}
            >
              <IconCheck className="w-5 h-5" />
              Выполнено сегодня
            </span>
          ) : (
            'Отметить выполненным'
          )}
        </button>
        <button
          onClick={onReset}
          aria-label="Сбросить прогресс"
          title="Сбросить прогресс"
          className="px-3 py-2.5 rounded-xl bg-white/5 text-teal-300 border border-white/10 font-medium hover:bg-teal-400/10 hover:border-teal-400/40 transition-all active:scale-95"
        >
          <IconReset className="w-5 h-5" />
        </button>
        <button
          onClick={onDelete}
          aria-label="Удалить привычку"
          title="Удалить привычку"
          className="px-3 py-2.5 rounded-xl bg-white/5 text-rose-300 border border-white/10 font-medium hover:bg-rose-400/10 hover:border-rose-400/40 transition-all active:scale-95"
        >
          <IconX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function pluralRu(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
