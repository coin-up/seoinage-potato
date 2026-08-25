import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { AccessBlocked, AccessLoading, useQrAccess } from "@/components/AccessGate";
import { PotatoShell } from "@/components/PotatoShell";
import { OrderBoard } from "@/components/OrderControls";
import { trpc } from "@/lib/trpc";

export default function AdminPage() {
  const { isLoading: accessLoading, allowed } = useQrAccess("admin");
  const ordersQuery = trpc.orders.list.useQuery({}, { refetchInterval: 1800, refetchOnWindowFocus: true, enabled: allowed });
  if (accessLoading) return <AccessLoading />;
  if (!allowed) return <AccessBlocked mode="admin" />;

  const pendingCount = ordersQuery.data?.pending.length ?? 0;
  const completedCount = ordersQuery.data?.completed.length ?? 0;

  return (
    <PotatoShell mode="admin" title="呼び出しボード。" eyebrow="管理者ボード" description="受付を受けた順に確認して、受け渡しが終わったら対応済みに移動します。" pendingCount={pendingCount} completedCount={completedCount} syncing={ordersQuery.isFetching}>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="sp-mini-card bg-yellow"><ClipboardCheck size={21} /><div><p className="text-xs font-black uppercase tracking-[0.15em] text-ink/55">next action</p><p className="mt-1 text-sm font-black">上から順番にお渡し</p></div></div>
        <div className="sp-mini-card bg-mint"><ShieldCheck size={21} /><div><p className="text-xs font-black uppercase tracking-[0.15em] text-ink/55">staff only</p><p className="mt-1 text-sm font-black">管理QRからアクセス中</p></div></div>
        <div className="sp-mini-card bg-lilac"><span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-black text-cream">{pendingCount}</span><div><p className="text-xs font-black uppercase tracking-[0.15em] text-ink/55">waiting</p><p className="mt-1 text-sm font-black">現在の未対応件数</p></div></div>
      </div>
      <OrderBoard />
    </PotatoShell>
  );
}
