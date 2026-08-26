# Verification notes

## 2026-08-25

- `GET /api/qr/access?mode=buyer&token=...` redirected to `/buyer` and rendered the buyer intake page with the store title 「谷口の背負い投げポテト」.
- `GET /api/qr/access?mode=admin&token=...` redirected to `/admin` and rendered the admin board with the pending/completed columns and ticket search.
- Desktop screenshots showed the peach Memphis layout, pastel mint/lilac/yellow shapes, red/cream potato palette, bold display headings, and dense but legible ticket controls.
- Mobile screenshots at 390px width showed the buyer, admin, and combined layouts stacking vertically without horizontal overflow in the captured pages.
- `pnpm check`, `pnpm test`, and `pnpm build` passed before the QR HttpOnly session migration; the session migration was followed by a second `pnpm check` and session-aware tests, which passed.
- Realtime design: order mutations call `publishOrderChange()`, `/api/realtime` serves authenticated SSE events, and the frontend invalidates the tRPC order query on `orders` events while retaining a short polling fallback.

## Attached QR code decoding

- `918.png` encodes `https://potatoshop-azemg89x.manus.space/buyer-only-x5k9m2a7q8r3`; this is mapped to the buyer-only entry.
- `919.png` encodes `https://potatoshop-azemg89x.manus.space/buyer-a7k9m2x5q8r3`; this is mapped to the combined buyer/management entry.
- `920.png` encodes `https://potatoshop-azemg89x.manus.space/admin-b4n6p1j9w2e8`; this is mapped to the admin entry.

- The attached buyer QR path `/buyer-only-x5k9m2a7q8r3` was opened on the current preview and redirected to `/buyer`; the page rendered after the server-issued QR session check.

- The attached combined QR path `/buyer-a7k9m2x5q8r3` redirected to `/combined` and rendered intake, search, pending, completed, and reset controls.
- Clicking the reset control opened a real modal confirmation dialog with accessible cancel and destructive-action buttons.

## Visual redesign verification

The attached advertising image is loaded from `/manus-storage/376_d1ff0108.png` in the shared functional-page hero and in the QR gate. The combined page was opened through the attached QR path and visually confirmed with the new coal-black background, red/gold/cream cards, high-contrast typography, and management controls. The buyer page includes the requested timing notice: `ご来店の10～15分前に注文してください。揚げる時間により多少前後する場合があります。ご了承ください。`

The input and action controls now explicitly use dark text on cream fields, larger semibold labels and help text, cream text on red action buttons, visible focus rings, and pressed-state shadows. The combined-page reset trigger and modal actions have matching explicit typography, contrast, and focus styles. After these changes, `pnpm check`, all 8 Vitest tests, and `pnpm build` passed; the buyer and combined pages were visually checked at desktop and mobile widths.

## Post-redesign browser flow

A Playwright run opened the buyer and combined QR entries in two browser pages. It successfully registered `Z999` from the buyer page, observed the ticket in the combined page, filtered it with `Z9`, moved it to completed, and cleared the single test row. The final empty-state checks passed. The script deliberately refuses to mutate the database when unrelated existing rows are detected; the only test row created during this verification was cleaned up afterward.

The same run also served as the live cross-page synchronization check because the buyer and combined pages stayed open simultaneously while the register mutation was reflected in the management page.

The expanded live browser verification kept one buyer page and two combined management pages open simultaneously. It passed all three cross-page checks: registration appeared in both management pages, completion removed the ticket from pending and placed it in completed on both, and clear-all removed it from both pages. The single test row was cleared at the end.

## Participant page reading order

The participant page now presents the order-timing notice, input checks, pickup steps, and help guidance before the ticket form. A final instruction explicitly directs the participant to enter the ticket at the bottom. The mobile full-page preview confirmed that the notice and instructions are readable before the form and that the form remains usable at 390px width.

Created `文化祭用操作マニュアル.md` with QR entry URLs, participant flow, staff roles, pending/completed handling, search, reset confirmation, synchronization guidance, troubleshooting, and a pre-opening checklist.

After moving the participant form to the bottom, the live browser flow was rerun successfully: the buyer page accepted `Z999` from the bottom form after the notices, the management pages received it, and the subsequent search, completion, and cleanup steps passed. The test row was removed at the end.

## Manual-to-site comparison

| Manual requirement | Existing site implementation | Status |
|---|---|---|
| QR-only entry for buyer, admin, and combined roles | Three QR alias routes issue HttpOnly sessions; direct feature paths are blocked | Matches |
| Buyer enters one letter plus three digits | Buyer form validates and normalizes the ticket code before submission | Matches |
| Notices are read before entry | Buyer page now places timing, input-check, pickup, and help guidance above the bottom form | Matches |
| Pending orders are oldest first | Admin and combined boards render pending orders in received-time order | Matches |
| Search, complete, and completed list | Management pages provide partial-code search and move rows to completed | Matches |
| Clear all with confirmation | Combined page uses an accessible confirmation dialog before deletion | Matches |
| Multiple-device updates | SSE events update connected pages, with short-interval refresh as fallback | Matches |
| Public production URL | The domain is configured, but the latest check showed Manus “Site unavailable due to unpaid billing” | Blocked by hosting billing state |

No additional code change was required after comparing the uploaded manual; the manual describes the same implementation already present in the latest checkpoint.

## Manual recheck after upload

Using the current development preview, the buyer QR alias resolved to `/buyer` and showed the timing notice, input checks, pickup steps, and the ticket form below those notices. The admin QR alias resolved to `/admin` and showed the oldest-first pending list, search field, completion buttons, and completed list. The combined QR alias resolved to `/combined` and showed the ticket form, reset button, search, pending list, and completed list together. Mobile screenshots were captured for all three aliases; buyer and combined layouts remained readable and the aliases continued to use the existing QR-session flow.

The configured production domain remains unavailable because Manus reports unpaid billing; production URL verification is therefore blocked until the hosting state is restored.

## Manual upload recheck safety note

The manual-upload recheck opened the current buyer, admin, and combined QR aliases successfully. A destructive end-to-end run was intentionally not performed because the management board already contained 4 pending and 5 completed live rows; the verification script refused to mutate or clear unrelated data. Existing end-to-end operation coverage remains documented from the controlled empty-state run, and the current manual-to-site comparison confirms the same routes and controls. The configured production domain still reports Manus unpaid-billing unavailability, so production URL verification remains pending until hosting is restored.

## GitHub Pages-only feasibility review

Conclusion: The current application cannot run completely on GitHub Pages alone. GitHub Pages serves static HTML, CSS, and JavaScript, and can run a build process via GitHub Actions, but it does not provide a persistent Node/Express runtime, a tRPC server endpoint, a MySQL database, an SSE stream, or server-side HttpOnly QR-session issuance. The repository can host the compiled Vite frontend, but the current backend and database must remain on a separate server/platform.

Project evidence: `package.json` builds both `vite build` and an Express entrypoint with esbuild; `server/_core/index.ts` creates the Express server and mounts tRPC; `server/db.ts` uses Drizzle with `drizzle-orm/mysql2` and `DATABASE_URL`; `server/realtime.ts` sends `text/event-stream`; `client/src/hooks/useRealtimeSync.ts` opens an `EventSource`; and `server/qrAccess.ts` handles QR access sessions on the server.

GitHub official documentation states that GitHub Pages is a static site hosting service for HTML, CSS, and JavaScript, and that custom workflows can build and deploy static artifacts. It also states that GitHub Pages does not support server-side languages. References: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages ; https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site ; https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages.

Practical options: keep the current full-stack architecture and host the frontend plus Express/tRPC/SSE plus MySQL on separate services; or convert the app to a static frontend and replace the backend with externally hosted serverless APIs/database services. GitHub Pages alone is sufficient only for a non-persistent demo or static UI, not for the current multi-device order management system.

## GitHub公開前監査とREADME

Git追跡対象を対象に、秘密鍵ファイル・`.env`系・GitHubトークン形式・主要APIキー形式・MySQL接続文字列・環境変数への実値代入を検索した。該当する秘密情報は検出されなかった。追跡対象のSQLはスキーマ／マイグレーションのみで、注文データのCSV・SQLite・DBファイルは検出されなかった。READMEにはNode Web Service、build/start、環境変数、MySQL、QR入口、当日の利用方法、初期化注意事項を記載した。

GitHub公開リポジトリ `coin-up/seoinage-potato` の存在と公開状態は確認済みだが、現在の接続ではpush時に403 Permission deniedが返ったため、README更新と最新コードの公開後表示確認はGitHub側の書き込み権限復旧後に行う必要がある。

## 60b7a7c2後の利用案内記録

60b7a7c2チェックポイント後、ユーザーへ次の公開サイトURLを案内した: `https://seoinagepota-fbjzzh6l.manus.space/`。QR入口URLとして、参加者用 `https://<本番ドメイン>/buyer-only-x5k9m2a7q8r3`、管理者用 `https://<本番ドメイン>/admin-b4n6p1j9w2e8`、購入・管理両用 `https://<本番ドメイン>/buyer-a7k9m2x5q8r3` を案内した。文化祭用操作マニュアルはプロジェクト内の`文化祭用操作マニュアル.md`で、QR入口、参加者受付、管理者の検索・対応済み移動、両用ページの初期化、トラブル対応を確認できると案内した。公開URLはその後「Site unavailable due to unpaid billing」となっているため、本番利用には公開状態の復旧が必要である。

## GitHub再接続後の公開確認

GitHub連携をDisconnect／再接続し、対象リポジトリ`coin-up/seoinage-potato`への書き込み権限を確認した。接続直後のGit HTTPS pushは403だったが、gh API経由で現在の作業ツリー140ファイルを`main`へ反映できた。最新コミットは`770995751d29aa511784615e779a21c363a2fc31`で、READMEの表示URLは`https://github.com/coin-up/seoinage-potato/blob/main/README.md`、デプロイ手順書の表示URLは`https://github.com/coin-up/seoinage-potato/blob/main/GitHub%E3%81%8B%E3%82%89%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E6%89%8B%E9%A0%86.md`。両ファイルは最新mainの公開内容として確認済みである。

最新`main`コミット`770995751d29aa511784615e779a21c363a2fc31`に対してGitHub APIで再確認した。`README.md`（5,065 bytes、https://github.com/coin-up/seoinage-potato/blob/main/README.md）と`GitHubからのデプロイ手順.md`（11,576 bytes、https://github.com/coin-up/seoinage-potato/blob/main/GitHub%E3%81%8B%E3%82%89%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E6%89%8B%E9%A0%86.md）は、いずれも最新main上で取得・表示確認できた。

GitHub再接続後の公開結果をユーザーへ案内した。403は解消され、現行プロジェクト140ファイルを`coin-up/seoinage-potato`の`main`へ反映済み。最新コミットは`770995751d29aa511784615e779a21c363a2fc31`。README URLは`https://github.com/coin-up/seoinage-potato/blob/main/README.md`、デプロイ手順URLは`https://github.com/coin-up/seoinage-potato/blob/main/GitHub%E3%81%8B%E3%82%89%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E6%89%8B%E9%A0%86.md`。

## バックアップ・障害時運用手順の追加確認

文化祭当日のバックアップ、紙運用、重複注文防止、復旧後の照合、復元・初期化判断を`文化祭当日バックアップ・障害時運用.md`へ追加し、既存の`文化祭用操作マニュアル.md`と`README.md`から参照できるようにした。追加後、`pnpm check`、`pnpm test`（4ファイル・9テスト）、`pnpm build`がすべて成功した。ビルド時には既存のチャンクサイズ警告のみが表示され、エラーは発生していない。

## 外部ホスティング現行条件の確認（2026-08-27）

Railway公式料金ページでは、Freeは月額0ドル・月1ドル分の利用クレジット、1サービスあたり最大1 vCPU／0.5 GB、1レプリカであり、Free Trialは30日間5ドル分のクレジットと記載されている。したがって、Railwayは「完全無料で無期限」とは案内せず、無料枠の利用上限と課金設定を確認して使う必要がある。参照: https://railway.com/pricing

Railway公式のSSEガイドでは、SSEは標準HTTPで動作する一方、15分のリクエスト上限があり、5分以上データがないと切断されるため、少なくとも5分以内のheartbeatと再接続が必要と説明されている。本アプリは15秒間隔のSSE heartbeat、ブラウザのEventSource再接続、自動再取得フォールバックを実装している。参照: https://docs.railway.com/guides/sse-vs-websockets

Render公式の無料枠ページでは、Free Web Serviceは15分間インバウンド通信がないと停止し、再起動に約1分かかること、Freeは本番アプリには使用しないよう明記されている。Renderの無料データストアはPostgres／Key Valueであり、本アプリのMySQL構成を無料の標準DBだけで置き換えることはできない。参照: https://render.com/docs/free

Render公式のMySQL手順では、MySQLはDockerのPrivate Serviceとして構成し、`/var/lib/mysql`にDiskを接続する必要があり、バックアップはディスクスナップショットではなく`mysqldump`等のDB推奨ツールを使うよう記載されている。参照: https://render.com/docs/deploy-mysql

Railway公式のVariablesページでは、サービスのVariablesタブで環境変数を登録し、変更後にレビューしてDeployする必要があること、サービス間参照変数（例:`DATABASE_URL=${{ MySQL.MYSQL_URL }}`）とsealed variablesが利用できることを確認した。参照: https://docs.railway.com/variables

Railway公式のPublic Networkingページでは、公開ドメインのGenerate Domain、Railway提供ドメイン、無料SSL証明書の自動発行・更新、カスタムドメイン対応が確認できる。参照: https://docs.railway.com/networking/public-networking

Render公式のEnvironment Variablesページでは、DashboardのEnvironmentからキーと値を登録し、Save, rebuild, and deploy／Save and deploy／Save onlyを選択できること、秘密情報をソースへコミットしないことを確認した。参照: https://render.com/docs/configure-environment-variables

Render公式のTLSページでは、`onrender.com`サブドメインとカスタムドメインに無料のマネージドTLSが提供され、HTTPはHTTPSへ自動リダイレクトされることを確認した。参照: https://render.com/docs/tls

## 外部ホスティング実行案内の追加

`GitHubからのデプロイ手順.md`へ、Railwayを第一候補とした最短実行チェックリストを追加した。GitHub接続、Web Service作成、MySQL追加、環境変数登録、Build／Start、HTTPSドメイン発行、本番QR作成、`Z999`による同期確認、テストデータ削除、開始前バックアップまでを順番に記載している。ログイン、課金設定、環境変数の実値入力は利用者本人の操作が必要であることも明記した。

Railway推奨の外部ホスティング手順をユーザーへ案内した。内容はGitHub接続、`pnpm build`／`pnpm start`、MySQLと`DATABASE_URL`、環境変数、Generate DomainによるHTTPS、QR URLのドメイン差し替え、`Z999`での本番確認、テストデータ削除、開始前バックアップである。Railwayの無料枠は無期限・完全無料ではなく、現行料金ページ上は月1ドル分の利用クレジットであること、課金設定と上限確認が必要なことも案内した。
