import { useState } from "react";
import { AlertTriangle, RotateCcw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { AccessBlocked, AccessLoading, useQrAccess } from "@/components/AccessGate";
import { PotatoShell } from "@/components/PotatoShell";
import { OrderBoard, TicketForm } from "@/components/OrderControls";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";

export default function CombinedPage() {
  const { isLoading: accessLoading, allowed } = useQrAccess("combined");
  const [clearOpen, setClearOpen] = useState(false);
  const utils = trpc.useUtils();
  const ordersQuery = trpc.orders.list.useQuery({}, { refetchInterval: 1800, refetchOnWindowFocus: true, enabled: allowed });
  const clearAll = trpc.orders.clearAll.useMutation({
    onSuccess: async ({ deletedRows }) => {
      setClearOpen(false);
      toast.success(`${deletedRows}件の受付データを初期化しました`);
      await utils.orders.list.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  if (accessLoading) return <AccessLoading />;
  if (!allowed) return <AccessBlocked mode="combined" />;
  const pendingCount = ordersQuery.data?.pending.length ?? 0;
  const completedCount = ordersQuery.data?.completed.length ?? 0;

  function handleClear() {
    if (clearAll.isPending) return;
    clearAll.mutate();
  }

  return (
    <PotatoShell mode="combined" title="ぜんぶ、ここで。" eyebrow="受付＆管理" description="受付登録からお渡し完了まで、スタッフ1画面でスムーズに管理できます。" pendingCount={pendingCount} completedCount={completedCount} syncing={ordersQuery.isFetching}>
      <div className="grid gap-5 xl:grid-cols-[minmax(330px,0.7fr)_minmax(0,1.3fr)]">
        <div className="space-y-4">
          <TicketForm compact />
          <section className="sp-card bg-ink p-5 text-cream sm:p-6">
            <div className="flex items-start gap-3"><Settings2 className="mt-0.5 shrink-0 text-yellow" size={20} /><div><h2 className="font-black">運営ツール</h2><p className="mt-2 text-xs font-semibold leading-5 text-cream/60">列をリセットして、次の時間帯の受付を始めるときに使います。</p></div></div>
            <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="mt-5 h-11 w-full rounded-xl border-2 border-cream/30 bg-transparent font-black text-cream hover:bg-cream/10 hover:text-cream"><RotateCcw size={16} /> 全データを初期化</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-2 border-ink bg-cream text-ink shadow-[7px_7px_0_#171513]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-xl font-black"><AlertTriangle className="text-red" size={22} />全データを初期化しますか？</AlertDialogTitle>
                  <AlertDialogDescription className="font-semibold leading-6 text-ink/65">未対応・対応済みを含む、すべての受付データを削除します。この操作は元に戻せません。</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={clearAll.isPending} className="rounded-xl border-2 border-ink bg-transparent font-black text-ink">キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClear} disabled={clearAll.isPending} className="rounded-xl bg-red font-black text-cream hover:bg-red-dark">{clearAll.isPending ? "削除中…" : "初期化する"}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
          <p className="px-2 text-xs font-bold leading-5 text-ink/50">運営メモ：同じチケット番号の重複受付は自動で防止されます。</p>
        </div>
        <OrderBoard />
      </div>
    </PotatoShell>
  );
}
