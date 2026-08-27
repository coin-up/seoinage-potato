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

## Railway無料プラン上限と代替候補（2026-08-27）
Railwayで新規プロジェクト作成時に「Free plan resource provision limit exceeded. Please upgrade to provision more resources!」が表示され、追加リソースの作成が停止した。これはアプリのビルドエラーではなく、Railwayアカウント側の無料プランのリソース作成上限によるもの。

Render公式情報を確認した。RenderはGitHub接続のNode.js Web Serviceを提供し、Free Web Serviceでは無料TLSとカスタムドメインが利用できるが、15分間インバウンド通信がないとスリープし、再起動に約1分かかる。また、Render公式のMySQL手順はDockerベースのPrivate Serviceと`/var/lib/mysql`への永続Diskを使う構成で、Freeインスタンスには対応しない。このため無料運用では、Node.js Web ServiceとMySQLの料金・永続性を別途確認する必要がある。

Aiven公式のFree MySQLは1GBストレージ・1GB RAM・単一ノード・自動バックアップを含み、クレジットカード不要と案内されているが、非アクティブ時に停止し、高トラフィック本番には非推奨である。参照URL：Render Free https://render.com/docs/free、Render Node Express https://render.com/docs/deploy-node-express-app、Render MySQL https://render.com/docs/deploy-mysql、Aiven Free MySQL https://aiven.io/free-mysql-database

## Aiven以外の無料候補追加調査（2026-08-27）
TiDB Cloud Starterの公式情報を確認した。TiDB Cloud StarterはMySQL互換のマネージドDBで、無料枠内ではクレジットカード不要。1インスタンスあたり月間50M Request Units、行ストレージ5GiB、列ストレージ5GiBが無料で、1 Organizationにつき最初の5インスタンスに無料枠が付く。無料枠を超えると新規接続が制限されるため、文化祭の小規模注文管理なら使用量を監視する必要がある。TiDB Cloud StarterはTLS接続を要求し、接続情報にユーザー名プレフィックスを含める必要がある。

Render Free Web ServiceはNode.jsアプリをGitHubから公開できるが、15分間通信がないと停止し復帰に約1分かかるため、本番用途には注意が必要。Render標準の無料DBはPostgres／Key Valueで、このアプリのMySQL構成にはそのまま使えない。無料優先の代替候補は、Render Free＋TiDB Cloud Starterの組み合わせとする。参照URL：https://docs.pingcap.com/tidbcloud/select-cluster-tier/、https://www.pingcap.com/tidb-cloud-starter-pricing-details/、https://render.com/docs/free、https://render.com/docs/deploy-node-express-app

## PostgreSQL移行（2026-08-27）
無料・安全性・登録容易性を優先し、データベースをMySQLからPostgreSQLへ移行した。`drizzle/schema.ts`を`pg-core`、`drizzle.config.ts`を`postgresql`、`server/db.ts`を`drizzle-orm/node-postgres`へ変更し、不要な`mysql2`依存を削除、`pg`と`@types/pg`を追加した。既存のMySQL用Drizzleメタデータは`drizzle/meta.mysql-backup/`へ退避し、PostgreSQL用journalと`drizzle/0000_curly_jack_power.sql`を生成した。生成SQLは`user_role`・`order_status` enum、`users`、`potatoOrders`の作成のみで、DROPや既存データ削除は含まれない。

検証結果：`pnpm check`成功、Vitest 4ファイル・9テスト成功、`pnpm build`成功。READMEと`GitHubからのデプロイ手順.md`をRender Free＋Render Postgres Free構成へ更新した。Render Freeはスリープ・無料Postgresの保存期間／容量／バックアップ制約があるため、文化祭前に起動確認と別途バックアップを行う。

## Render旧コミット取得の原因と対処（2026-08-27）
Renderの失敗ログでは、コミット`7709957`が`mysql2`／`connectToMySQL`を実行し、`10.24.32.59:3306`への`ECONNREFUSED`が発生していた。これはRenderがPostgreSQL移行前のGitHubコードを取得していたためで、RenderのDATABASE_URL設定だけの問題ではなかった。PostgreSQL対応済みの`drizzle/schema.ts`、`server/db.ts`、`drizzle.config.ts`、`package.json`、`pnpm-lock.yaml`と関連文書を統合し、GitHubの先行コミットと競合解消後、`coin-up/seoinage-potato`の`main`へコミット`0e1b3cca97af3671cedbbb04c671496f0b3bc92b`として反映した。次はRenderのManual Deployで最新コミットを取得し、MySQL参照が消え、PostgreSQLのマイグレーションと起動が成功することを確認する。

## Render PostgreSQL本番疎通（2026-08-27）
GitHub mainのPostgreSQL対応コミット`0e1b3cca97af3671cedbbb04c671496f0b3bc92b`をRenderへ手動デプロイした。Renderログで`[OAuth] Initialized with baseURL: https://api.manus.im`、`Server running on http://localhost:10000/`、公開URL、Liveを確認し、旧MySQLの3306接続エラーは解消した。

本番QR入口`https://seoinage-potato.onrender.com/buyer-only-x5k9m2a7q8r3`から参加者ページへ遷移し、確認用`X927`を登録したところ「X927を受付しました」と表示された。管理者QR入口`https://seoinage-potato.onrender.com/admin-b4n6p1j9w2e8`では未対応1件として`X927`が表示され、対応操作後に未対応0件・対応済み1件へ移動した。PostgreSQL実DBへの登録・取得・状態更新が成功した証拠である。`X927`は確認用データとして対応済みに移動済みで、実注文データは操作していない。

検索検証では管理者QR入口で`X928`を検索し、未対応一覧が`X928`のみへ絞り込まれることを確認した。検索欄を維持したまま対応操作を行い、画面更新後は未対応0件・対応済み1件（`X928`）となった。`X927`は先行テストで対応済みのため、対応済み総数は2件になった。

全件初期化検証では、両用QR入口から管理画面を開き、対応済みテストデータ`X927`・`X928`の2件だけが表示されていることを確認した。確認ダイアログで初期化を確定後、「2件の受付データを初期化しました」と表示され、再取得後に未対応0件・対応済み0件となった。実注文データは表示されていない状態で実施した。

補足：Renderの本番Start Commandは`pnpm db:push && pnpm start`に設定してデプロイした。失敗時ログでは`No schema changes, nothing to migrate`まで実行された後、旧MySQL URLへ接続して失敗していた。新コミット・Render PostgreSQL Internal URLへ修正後のデプロイはLiveとなり、その後の実DB注文登録が成功したため、PostgreSQLスキーマ適用とアプリ起動の組み合わせが機能していることを確認した。

## Renderログ取得障害の扱い（2026-08-27）
最新デプロイはLiveで、Render管理画面のログ欄は`Failed to fetch (api.render.com)`となり、`db:push`の明示的な実行行を追加取得できなかった。そのため、`db:push`のログ証拠については未確認として扱い、断定しない。一方、PostgreSQL実DBに対して注文登録、管理者検索、対応済み移動、両用ページの全件初期化を実行できたため、スキーマ適用済み・アプリ接続済みであることは実DBの主要フロー成功で確認した。Renderのログ取得が復旧した場合に、起動ログの補足確認を行う。

SSE本番検証では、両用QR入口の同一セッション上でEventSourceを2本同時接続し、両方の`ready`イベントを確認した。確認用チケット`X930`を登録すると、両接続が同一`orders`イベント（同じ`changedAt`）を受信した。Render本番で注文変更のSSEリアルタイム配信が機能していることを確認した。X930は後続の全件初期化で削除する。

Render本番の画面では広告画像枠が空白になり、`/manus-storage/376_d1ff0108.png`が外部Render環境から取得できていない。クライアント参照箇所は`client/src/components/AccessGate.tsx`と`client/src/components/PotatoShell.tsx`で、同じ参照はローカルのWebDevプレビューでは画像表示できる。Render配信用に画像参照先を変更する必要がある。

Render本番の`https://seoinage-potato.onrender.com/buyer-only-x5k9m2a7q8r3`を再読み込みし、広告画像が正常表示されることを確認した。`/potato-ad.webp`をアプリ内公開資産として配信する修正コミット`0106c3f`が反映済み。

Render Freeの本番URLを連続測定した結果、現在のアクセスは1回目4.989秒、2回目3.956秒、いずれもHTTP 200だった。非稼働15分後の真のスリープ復帰は待機時間の都合で未再現だが、Render管理画面のFreeプラン警告（初回は50秒以上遅延し得る）は確認済み。

スマートフォン表示では、広告画像を4:3で表示し、追加キャッチコピーを画像上に重ねず画像直下の黒帯へ移動するCSS調整を実施。これにより広告内の文字・人物・ポテトがキャッチコピーで隠れにくくなる。型チェック、9テスト、本番ビルドは成功。ローカルWebDevのスクリーンショット取得は失敗したため、Render再デプロイ後の実機画面で最終確認する。

ユーザー実機で15分以上アクセスしない状態の後にRender本番参加者ページを開き、画面・広告画像・注意書きが表示されることを確認した。Render Freeのスリープ復帰後もアクセス可能であることを実機で確認（正確な復帰秒数は画面撮影時刻のみのため未測定）。

## 購入者ページ件数表示の削除（2026-08-27）

購入者ページ専用に`PotatoShell`の`showStats={false}`を設定し、ヘッダーの「未対応」「対応済」件数チップを非表示にした。管理者ページと両用ページは`showStats`の既定値がtrueのため、両チップを維持する。`pnpm check`、Vitest 4ファイル・9テスト、`pnpm build`は成功した。開発プレビューの購入者ルートはQRアクセス確認画面であるため、認証後の表示は本番ブラウザで確認する。

本番URLの購入者QR入口は認証後に購入者ページを表示したが、確認時点では「0 未対応」「0 対応済」チップが残っており、広告コピーも画像上に重なっていた。これはRenderが最新コミット`5bf7544`をまだ配信していない状態と判断される。GitHub反映後、Renderで最新コミットをデプロイして再確認する。

最新コミットのRender本番確認（2026-08-27 08:33頃）では、購入者QR入口から遷移したページに「未対応」「対応済」の件数チップは表示されなかった。広告画像は初回キャプチャ直後には読み込み中で黒く見えたが、約10秒後の再確認で正常表示された。15分以上無通信後の実機表示成功に加え、今回の最新デプロイでは件数削除と広告画像表示を本番画面で確認した。

## Render Freeの復帰遅延短縮調査（2026-08-27）

Render公式Freeプラン説明では、Free Web Serviceは15分間インバウンド通信がないと停止し、次のHTTPリクエストまたは新しいWebSocket接続で起動する。起動には約1分かかると説明され、ブラウザには起動中のローディング画面が表示される。したがって、15分後の20～30秒程度の待ち時間は、アプリの初期化だけでなく、無料インスタンスの復帰待ちが主因であり、コード変更だけでゼロにはできない。参照: https://render.com/docs/free

現行サーバーの起動処理は、Express生成、JSON／URLエンコードパーサー、OAuth・ストレージ・QR・SSE・サイト設定・tRPCルート登録、development時のVite初期化、production時の静的ファイル設定、ポート探索、listenで構成されている。本番ではViteの起動は実行されず、DB接続も`getDb()`が最初に呼ばれた時の遅延初期化である。`pnpm build`の静的JSは約725KB（gzip約210KB）だが、Renderのスリープ復帰時間そのものはフロントエンドのコード分割よりもサーバー再起動待ちの影響が大きい。

## 起動軽量化の実装（2026-08-27）

RenderのFree Web Serviceは15分無通信後に停止し、次のHTTPリクエストで復帰するため、20～30秒の待ち時間の大部分は無料インスタンスのコールドスタートに由来する。アプリ側では、本番の`PORT`が指定されている場合にローカル向けのポート空き確認（TCPソケットの作成・listen・close）を省略し、指定PORTへ直接listenするよう軽量化した。ローカル開発でPORTが未指定の場合は従来どおりポート探索を維持するため、開発時の衝突回避とRender本番の短縮を両立する。

`server/port.test.ts`を追加し、型チェック、Vitest 5ファイル・11テスト、本番ビルドが成功した。今回の変更だけでRenderの起動待ちを大幅に消せる保証はなく、Renderへ反映後に15分無通信の初回アクセス時間を再計測して効果を判定する。無料プランの約1分起動仕様自体を避けるには、Reserved等の常時稼働プランまたは別の常時稼働ホスティングが必要になる。

参照: https://render.com/docs/free
