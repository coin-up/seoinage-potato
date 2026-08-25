import { LockKeyhole, QrCode, ScanLine } from "lucide-react";
import type { QrAccessMode } from "@shared/const";
import { trpc } from "@/lib/trpc";

export function useQrAccess(mode: QrAccessMode) {
  const query = trpc.orders.access.useQuery(undefined, { retry: false, staleTime: 60_000 });
  return {
    isLoading: query.isLoading,
    allowed: query.data?.mode === mode || query.data?.mode === "combined",
  };
}

export function AccessLoading() {
  return <main className="sp-gate grid min-h-screen place-items-center px-5 text-ink"><div className="sp-card bg-cream px-7 py-6 text-center"><div className="mx-auto mb-3 h-3 w-3 animate-ping rounded-full bg-red" /><p className="text-sm font-black">QRアクセスを確認中…</p></div></main>;
}

export function AccessBlocked({ mode }: { mode?: QrAccessMode }) {
  const label = mode === "buyer" ? "購入者受付" : mode === "admin" ? "管理者ページ" : mode === "combined" ? "購入・管理両用" : "受付システム";

  return (
    <main className="sp-gate min-h-screen overflow-hidden px-5 py-8 text-ink sm:px-8">
      <div className="sp-deco sp-deco-circle-mint" />
      <div className="sp-deco sp-deco-circle-yellow" />
      <div className="sp-deco sp-deco-triangle" />
      <div className="sp-deco sp-deco-diamond" />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center">
        <section className="sp-card relative w-full max-w-lg overflow-hidden bg-cream p-7 text-center sm:p-10">
          <div className="mb-6 overflow-hidden rounded-2xl border-2 border-ink bg-ink">
            <img src="/manus-storage/376_d1ff0108.png" alt="谷口の背負い投げポテト広告" className="h-32 w-full object-cover object-center opacity-95 sm:h-40" />
          </div>
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[22px] bg-red text-yellow shadow-[5px_5px_0_#171513]"><LockKeyhole size={30} strokeWidth={2.5} /></div>
          <p className="sp-kicker mb-3">谷口の背負い投げポテト / {label}</p>
          <h1 className="sp-display text-3xl uppercase leading-tight sm:text-5xl">QRを読み取って<br />受付へ</h1>
          <p className="mx-auto mt-5 max-w-md text-sm font-semibold leading-7 text-ink/65 sm:text-base">この画面は配布されたQRコードからのみ利用できます。入口のQRコードをカメラで読み取り、もう一度アクセスしてください。</p>
          <div className="mx-auto mt-8 flex max-w-sm items-center gap-3 rounded-2xl border-2 border-dashed border-ink/25 bg-peach/70 p-4 text-left">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint text-ink"><QrCode size={23} strokeWidth={2.5} /></div>
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-ink/50">QR only entry</p><p className="mt-1 text-sm font-bold">URLを直接入力しても入れません</p></div>
            <ScanLine className="ml-auto text-red" size={22} />
          </div>
          <div className="sp-sticker mx-auto mt-7 w-fit rotate-[-3deg] bg-yellow px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">谷口の背負い投げポテト / 受付カウンター</div>
        </section>
      </div>
    </main>
  );
}
