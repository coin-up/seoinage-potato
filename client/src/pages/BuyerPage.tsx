import { CheckCircle2, CircleHelp, Flame, Info } from "lucide-react";
import { AccessBlocked, AccessLoading, useQrAccess } from "@/components/AccessGate";
import { PotatoShell } from "@/components/PotatoShell";
import { TicketForm } from "@/components/OrderControls";

export default function BuyerPage() {
  const { isLoading, allowed } = useQrAccess("buyer");
  if (isLoading) return <AccessLoading />;
  if (!allowed) return <AccessBlocked mode="buyer" />;

  return (
    <PotatoShell mode="buyer" title="受付はここから。" eyebrow="購入者受付" description="QRチケットの番号を入力して、お受け取りの受付を完了してください。">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <TicketForm />
        <aside className="space-y-4">
          <div className="sp-card bg-red p-6 text-cream sm:p-7">
            <div className="mb-5 flex items-center justify-between"><span className="sp-kicker bg-yellow text-ink">HOW TO GET</span><Flame size={28} className="text-yellow" fill="currentColor" /></div>
            <h2 className="sp-display text-3xl leading-none text-yellow">できあがりを<br />待っててね！</h2>
            <ol className="mt-6 space-y-4 text-sm font-bold leading-5 text-cream/85">
              <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-yellow text-sm font-black text-ink">01</span><span>チケット番号を入力して受付する</span></li>
              <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-yellow text-sm font-black text-ink">02</span><span>カウンターで番号を呼ばれるまで待つ</span></li>
              <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-yellow text-sm font-black text-ink">03</span><span>番号を見せて、揚げたてを受け取る</span></li>
            </ol>
          </div>
          <div className="sp-card bg-mint p-5"><div className="flex items-start gap-3"><Info className="mt-0.5 shrink-0" size={19} /><div><h2 className="font-black">入力前にチェック</h2><p className="mt-2 text-sm font-semibold leading-6 text-ink/65">英字は大文字・数字は3桁です。入力後のチケット番号は変更できません。</p></div></div></div>
          <div className="sp-card bg-lilac/70 p-5"><div className="flex items-center gap-3"><CircleHelp size={21} /><p className="text-sm font-bold leading-5">困ったときは、近くのスタッフにチケットを見せてください。</p></div></div>
          <div className="flex items-center gap-2 px-2 text-xs font-black text-ink/45"><CheckCircle2 size={15} className="text-red" /> 受付状況はスタッフ画面へすぐ届きます</div>
        </aside>
      </div>
    </PotatoShell>
  );
}
