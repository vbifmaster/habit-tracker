'use client';

import { useEffect, useState } from 'react';

type Habit = {
  id: string;
  name: string;
  completions: string[];
};

const STORAGE_KEY = 'habit-tracker-v1';

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

/* ---------- Stylized icons (teal & crimson palette) ---------- */

type IconProps = { className?: string };

function IconSparkle({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
      <path d="M19 4l.7 1.8L21.5 6.5l-1.8.7L19 9l-.7-1.8L16.5 6.5l1.8-.7L19 4z" />
      <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8L16.5 18.2l1.8-.7L19 15z" />
    </svg>
  );
}

function IconTrophy({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
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

function IconSeedling({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 21h14" />
      <path d="M12 21V11" />
      <path d="M12 11C9 11 6.5 8.5 6.5 5.5 9.5 5.5 12 8 12 11z" />
      <path d="M12 14c3 0 5.5-2 5.5-5C14.5 9 12 11 12 14z" />
    </svg>
  );
}

function IconFlame({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3c.8 3.5 4.5 4.5 4.5 9a4.5 4.5 0 1 1-9 0c0-2 1-3.2 2.2-4 .3 1.8 1.4 2.5 2.3 2.5C12 8.5 12 6 12 3z" />
    </svg>
  );
}

function IconCheck({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconReset({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconX({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function IconPlus({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
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
      className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold text-white shrink-0 shadow-sm ${
        isTeal
          ? 'bg-gradient-to-br from-teal-400 to-teal-600'
          : 'bg-gradient-to-br from-rose-400 to-rose-600'
      }`}
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
        // Strip any legacy fields (e.g. emoji) and keep what we need
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-rose-50 px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <IconSparkle className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 shrink-0" />
            Трекер привычек
          </h1>
          <p className="text-slate-500 mt-1 capitalize">{todayFormatted}</p>
        </header>

        <Achievements progress={overall} habitCount={habits.length} />

        <form onSubmit={addHabit} className="mb-6 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Новая привычка..."
            maxLength={60}
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-3 rounded-xl bg-slate-900 text-white font-medium shadow-sm hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-1.5"
          >
            <IconPlus className="w-4 h-4" />
            Добавить
          </button>
        </form>

        {!hydrated ? null : habits.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <IconSeedling className="w-16 h-16 mx-auto mb-3 text-teal-400 animate-pulse" />
            <p>Добавьте первую привычку, чтобы начать путь.</p>
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

        <footer className="mt-12 text-center text-xs text-slate-400">
          Данные хранятся локально в вашем браузере
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

  const status: { text: string; icon: React.ReactNode } =
    habitCount === 0
      ? { text: 'Начните путь', icon: null }
      : progress >= 80
        ? {
            text: 'Отлично!',
            icon: <IconFlame className="w-6 h-6 text-rose-500 shrink-0" />,
          }
        : progress >= 50
          ? { text: 'Хороший темп', icon: null }
          : progress >= 20
            ? { text: 'Продолжайте', icon: null }
            : { text: 'Только старт', icon: null };

  return (
    <section className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <IconTrophy className="w-5 h-5 text-rose-500 shrink-0" />
        Мои достижения
      </h2>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg width="120" height="120" className="-rotate-90">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
            <defs>
              <linearGradient
                id="progressGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{progress}%</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">За эту неделю</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-1.5 min-w-0">
            <span className="truncate">{status.text}</span>
            {status.icon}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {habitCount === 0
              ? 'Привычек пока нет'
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
      className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-300 ${
        doneToday
          ? 'border-teal-200 bg-gradient-to-br from-white to-teal-50/40'
          : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <HabitAvatar name={habit.name} id={habit.id} />
          <h3 className="font-semibold text-slate-900 truncate">{habit.name}</h3>
        </div>
        <span className="text-sm font-medium text-slate-500 shrink-0">
          {progress}%
        </span>
      </div>

      <div className="mb-4">
        <div className="flex gap-1.5 mb-1">
          {week.map((d) => {
            const done = habit.completions.includes(d);
            const isToday = d === today;
            return (
              <div
                key={d}
                className={`
                  flex-1 h-2 rounded-full transition-all duration-500
                  ${done ? 'bg-gradient-to-r from-teal-400 to-rose-400' : 'bg-slate-200'}
                  ${isToday && !done ? 'ring-2 ring-teal-300 ring-offset-1 ring-offset-white' : ''}
                `}
                title={d}
              />
            );
          })}
        </div>
        <div className="flex gap-1.5">
          {week.map((d) => (
            <div
              key={d}
              className={`flex-1 text-center text-[10px] uppercase tracking-wide ${
                d === today ? 'text-slate-900 font-semibold' : 'text-slate-400'
              }`}
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
            flex-1 py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-95
            ${
              doneToday
                ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm shadow-teal-500/30'
                : 'bg-slate-900 text-white hover:bg-slate-700'
            }
          `}
        >
          {doneToday ? (
            <span className="flex items-center justify-center gap-2">
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
          className="px-3 py-2.5 rounded-xl bg-slate-100 text-teal-600 font-medium hover:bg-teal-50 transition-all active:scale-95"
        >
          <IconReset className="w-5 h-5" />
        </button>
        <button
          onClick={onDelete}
          aria-label="Удалить привычку"
          title="Удалить привычку"
          className="px-3 py-2.5 rounded-xl bg-slate-100 text-rose-500 font-medium hover:bg-rose-50 transition-all active:scale-95"
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
