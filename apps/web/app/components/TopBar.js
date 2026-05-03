"use client";

export default function TopBar({ title, subtitle, children, searchPlaceholder, onSearch }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/20 dark:border-white/[0.05] bg-white/10 dark:bg-black/60 backdrop-blur-xl px-6 py-3">
      <div className="min-w-0">
        <h1 className="text-xl font-black text-slate-800 dark:text-white truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {searchPlaceholder && (
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input onChange={e => onSearch?.(e.target.value)} placeholder={searchPlaceholder}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-white/40 dark:border-white/[0.08] bg-white/25 dark:bg-zinc-900 text-sm text-slate-700 dark:text-zinc-300 placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none focus:border-violet-400 dark:focus:border-teal-500 w-52 backdrop-blur-sm" />
          </div>
        )}
        {children}
      </div>
    </header>
  );
}
