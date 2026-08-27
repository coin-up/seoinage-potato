import type { ReactNode } from "react";
import { Check, Clock3, Flame, Hash, Radio, RotateCcw } from "lucide-react";

export type PageMode = "buyer" | "admin" | "combined";

type PotatoShellProps = {
  mode: PageMode;
  title: string;
  eyebrow: string;
  description: string;
  pendingCount?: number;
  completedCount?: number;
  syncing?: boolean;
  showStats?: boolean;
  children: ReactNode;
};

const modeLabels: Record<PageMode, string> = {
  buyer: "購入者受付",
  admin: "管理者ボード",
  combined: "受付＆管理",
};

export function PotatoShell({ mode, title, eyebrow, description, pendingCount = 0, completedCount = 0, syncing = false, showStats = true, children }: PotatoShellProps) {
  return (
    <main className="sp-app min-h-screen overflow-hidden px-4 py-4 text-ink sm:px-7 sm:py-7">
      <div className="sp-deco sp-deco-circle-mint" />
      <div className="sp-deco sp-deco-circle-yellow" />
      <div className="sp-deco sp-deco-triangle" />
      <div className="sp-deco sp-deco-diamond" />
      <div className="sp-deco sp-deco-bars" />
      <div className="sp-deco sp-deco-dots" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <a href="/" className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-ink/55 transition-transform hover:-translate-y-0.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-red text-yellow shadow-[3px_3px_0_#171513]"><Flame size={17} fill="currentColor" /></span>
              谷口の背負い投げポテト
            </a>
            <div className="flex flex-wrap items-center gap-2">
              <span className="sp-kicker bg-ink text-cream">{modeLabels[mode]}</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-ink/50"><Radio size={13} className={syncing ? "animate-pulse text-red" : "text-mint-strong"} /> {syncing ? "更新中" : "リアルタイム同期"}</span>
            </div>
            <h1 className="sp-display mt-3 max-w-4xl text-4xl uppercase leading-[0.98] sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-ink/65 sm:text-base">{description}</p>
          </div>
          {showStats && <div className="flex shrink-0 items-center gap-2 self-start sm:self-end">
            <StatChip icon={<Clock3 size={15} />} value={pendingCount} label="未対応" tone="yellow" />
            <StatChip icon={<Check size={15} />} value={completedCount} label="対応済" tone="mint" />
          </div>}
        </header>
        <div className="sp-hero mb-5 sm:mb-7">
          <img src="/potato-ad.webp" alt="揚げたてのフライドポテトと谷口の背負い投げポテト広告" />
          <div className="sp-hero-copy">
            <h2>揚げたて、最強。</h2>
            <p>谷口の背負い投げポテト / うまさ、投げ込め。</p>
          </div>
        </div>
        {children}
        <footer className="mt-8 flex flex-col gap-2 border-t-2 border-ink/10 pt-4 text-xs font-bold text-ink/45 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2"><Hash size={13} /> TICKET DESK / 文化祭運営用</span>
          <span className="inline-flex items-center gap-1"><RotateCcw size={12} /> 変更は全端末へ自動反映</span>
        </footer>
      </div>
    </main>
  );
}

function StatChip({ icon, value, label, tone }: { icon: ReactNode; value: number; label: string; tone: "yellow" | "mint" }) {
  return (
    <div className={`sp-stat-chip ${tone === "yellow" ? "bg-yellow" : "bg-mint"}`}>
      <span className="opacity-70">{icon}</span>
      <strong className="text-xl leading-none">{value}</strong>
      <span className="text-[10px] font-black uppercase tracking-[0.14em] opacity-65">{label}</span>
    </div>
  );
}
