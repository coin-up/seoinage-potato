import { useState } from "react";
import { Check, ChevronRight, Clock3, Search, Sparkles, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

export function TicketForm({ compact = false }: { compact?: boolean }) {
  const [ticketCode, setTicketCode] = useState("");
  const utils = trpc.useUtils();
  const register = trpc.orders.register.useMutation({
    onSuccess: async ({ ticketCode: registeredCode }) => {
      setTicketCode("");
      toast.success(`${registeredCode} を受付しました`, { description: "管理カウンターへ受付内容を送信しました。" });
      await utils.orders.list.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const normalizedCode = ticketCode.toUpperCase();
  const isValid = /^[A-Z][0-9]{3}$/.test(normalizedCode);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || register.isPending) return;
    register.mutate({ ticketCode: normalizedCode });
  }

  return (
    <section className={`sp-card relative overflow-hidden bg-cream ${compact ? "p-5 sm:p-6" : "p-6 sm:p-9"}`}>
      <div className="absolute right-[-22px] top-[-22px] grid h-24 w-24 rotate-12 place-items-center rounded-full bg-yellow/70 text-red"><Ticket size={34} strokeWidth={2.5} /></div>
      <div className="relative">
        <span className="sp-kicker bg-red text-yellow"><Sparkles size={13} /> 受付カウンター</span>
        <h2 className={`sp-display mt-4 ${compact ? "text-3xl" : "text-4xl sm:text-5xl"}`}>チケット番号を<br className="sm:hidden" /> 入力</h2>
        <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-ink/60">QRチケットに記載された番号を、そのまま入力してください。</p>
        <form className="mt-6" onSubmit={submit}>
          <label htmlFor="ticket-code" className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-ink/80">英字1文字 + 3桁番号</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Input id="ticket-code" value={ticketCode} onChange={event => setTicketCode(event.target.value.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase())} placeholder="例：A123" autoComplete="off" autoCapitalize="characters" inputMode="text" aria-describedby="ticket-help" className="sp-input h-14 rounded-2xl border-2 border-ink bg-cream px-5 text-xl font-black uppercase tracking-[0.2em] text-ink placeholder:font-bold placeholder:tracking-normal placeholder:text-ink/50 focus-visible:ring-4 focus-visible:ring-mint/50 focus-visible:ring-offset-2" />
              {ticketCode.length > 0 && <button type="button" aria-label="入力を消去" onClick={() => setTicketCode("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/70 hover:bg-peach hover:text-ink"><X size={18} /></button>}
            </div>
            <Button type="submit" disabled={!isValid || register.isPending} className="sp-button h-14 rounded-2xl bg-red px-6 text-base font-black text-cream shadow-[3px_3px_0_var(--ink)] hover:bg-red-dark disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/45 sm:min-w-40">{register.isPending ? "送信中…" : <><span>受付する</span><ChevronRight size={19} /></>}</Button>
          </div>
          <p id="ticket-help" className={`mt-3 text-sm font-bold ${ticketCode.length > 0 && !isValid ? "text-red" : "text-ink/75"}`}>{ticketCode.length > 0 && !isValid ? "英字1文字＋3桁番号で入力してください（例：A123）" : "入力後、受付ボタンを押してください。"}</p>
        </form>
        <div className="mt-6 flex items-start gap-3 border-t-2 border-ink/10 pt-4 text-sm font-bold leading-5 text-ink/75"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-yellow text-ink"><Check size={13} strokeWidth={3} /></span>受付確定後のチケット番号変更はできません。入力内容を確認してください。</div>
      </div>
    </section>
  );
}

export function OrderBoard({ canComplete = true, showSearch = true }: { canComplete?: boolean; showSearch?: boolean }) {
  const [search, setSearch] = useState("");
  useRealtimeSync();
  const utils = trpc.useUtils();
  const ordersQuery = trpc.orders.list.useQuery({ search: search || undefined }, { refetchInterval: 1800, refetchOnWindowFocus: true });
  const complete = trpc.orders.complete.useMutation({
    onSuccess: async () => {
      toast.success("対応済みに移動しました");
      await utils.orders.list.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const pending = ordersQuery.data?.pending ?? [];
  const completed = ordersQuery.data?.completed ?? [];

  return (
    <section className="space-y-4 text-ink">
      {showSearch && <div className="sp-card flex flex-col gap-3 bg-lilac/75 p-4 text-ink sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><p className="text-sm font-black">チケットを検索</p><p className="mt-1 text-xs font-bold text-ink/55">番号の一部でも検索できます。</p></div><div className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/45" size={18} /><Input value={search} onChange={event => setSearch(event.target.value.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase())} placeholder="A123 を検索" className="h-12 rounded-xl border-2 border-ink bg-cream pl-11 pr-10 text-base font-black uppercase tracking-[0.14em] text-ink placeholder:tracking-normal placeholder:text-ink/55 focus-visible:ring-4 focus-visible:ring-mint/50 focus-visible:ring-offset-2" />{search && <button type="button" aria-label="検索を消去" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/70 hover:bg-peach hover:text-ink"><X size={16} /></button>}</div></div>}
      <div className="grid gap-4 xl:grid-cols-2">
        <OrderColumn title="未対応" note="受付が古い順に表示" icon={<Clock3 size={19} />} tone="yellow" orders={pending} isLoading={ordersQuery.isLoading} emptyText={search ? "検索に一致する未対応チケットはありません。" : "未対応のチケットはありません。"} action={canComplete ? order => complete.mutate({ id: order.id }) : undefined} isActionPending={complete.isPending} />
        <OrderColumn title="対応済み" note="お渡し完了のチケット" icon={<Check size={19} />} tone="mint" orders={completed} isLoading={ordersQuery.isLoading} emptyText={search ? "検索に一致する対応済みチケットはありません。" : "対応済みのチケットはありません。"} />
      </div>
      {ordersQuery.isError && <p className="rounded-xl bg-red/10 p-4 text-sm font-bold text-red">データを取得できませんでした。通信状態を確認してください。</p>}
    </section>
  );
}

function OrderColumn({ title, note, icon, tone, orders, isLoading, emptyText, action, isActionPending }: { title: string; note: string; icon: React.ReactNode; tone: "yellow" | "mint"; orders: Array<{ id: number; ticketCode: string; status: "pending" | "completed"; receivedAt: number; completedAt: number | null }>; isLoading: boolean; emptyText: string; action?: (order: { id: number; ticketCode: string }) => void; isActionPending?: boolean }) {
  return <div className="sp-card overflow-hidden bg-white/90 p-4 text-ink sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl text-ink ${tone === "yellow" ? "bg-yellow" : "bg-mint"}`}>{icon}</span><div><h2 className="text-lg font-black">{title}</h2><p className="text-sm font-bold text-ink/70">{note}</p></div></div><span className={`grid h-8 min-w-8 place-items-center rounded-full px-2 text-sm font-black ${tone === "yellow" ? "bg-yellow text-ink" : "bg-mint text-ink"}`}>{orders.length}</span></div><div className="space-y-2">{isLoading && <div className="sp-skeleton h-[72px] rounded-2xl" />}{!isLoading && orders.length === 0 && <div className="rounded-2xl border-2 border-dashed border-ink/15 px-4 py-9 text-center"><p className="text-sm font-bold text-ink/70">{emptyText}</p></div>}{orders.map(order => <OrderRow key={order.id} order={order} action={action} isActionPending={isActionPending} />)}</div></div>;
}

function OrderRow({ order, action, isActionPending }: { order: { id: number; ticketCode: string; status: "pending" | "completed"; receivedAt: number; completedAt: number | null }; action?: (order: { id: number; ticketCode: string }) => void; isActionPending?: boolean }) {
  const completed = order.status === "completed";
  return <div className={`sp-order-row flex items-center gap-3 rounded-2xl border-2 p-3 ${completed ? "border-mint/70 bg-mint/20" : "border-yellow/80 bg-yellow/15"}`}><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-xl font-black tracking-tight text-cream">{order.ticketCode.slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="text-xl font-black leading-none tracking-[0.13em]">{order.ticketCode}</p><p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-ink/70"><Clock3 size={12} /> {formatTime(order.receivedAt)}</p></div>{action && !completed ? <Button disabled={isActionPending} onClick={() => action({ id: order.id, ticketCode: order.ticketCode })} className="h-10 rounded-xl bg-red px-3 text-sm font-black text-cream shadow-[2px_2px_0_var(--ink)] hover:bg-red-dark sm:px-4"><Check size={15} /><span className="hidden sm:inline">対応済みにする</span><span className="sm:hidden">対応</span></Button> : <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-mint px-2.5 py-1.5 text-xs font-black text-ink"><Check size={13} /> 済</span>}</div>;
}

export function formatTime(timestamp: number | null) {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
