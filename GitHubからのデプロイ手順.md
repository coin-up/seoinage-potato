# GitHubリポジトリからの本番デプロイ手順

## 結論

このプロジェクトはGitHub Pagesではなく、Node.jsのWeb ServiceとPostgreSQLを実行できるホスティングへデプロイします。無料優先・登録の簡単さを重視する今回の構成は、**Render Free Web Service＋Render Postgres Free**です。RenderはGitHubリポジトリからNode.js／Expressアプリをデプロイでき、無料Web ServiceでもTLSと公開URLを利用できます。[1] [2]

この構成では、MySQL用ドライバーを使わず、Drizzle ORMのPostgreSQLドライバーを使用します。データベースは`DATABASE_URL`で接続します。Render Free Web Serviceは15分間アクセスがないと停止し、復帰に約1分かかる場合があります。また、無料Postgresには保存期間、容量、バックアップの制約があります。文化祭開始前に必ず起動確認を行い、当日はバックアップ・障害時運用手順を併用してください。[1]

## 構成

| 役割 | サービス | 条件 |
|---|---|---|
| Webアプリ | Render Web Service（Free） | Node.js、GitHub自動デプロイ、HTTPS |
| データベース | Render Postgres（Free） | PostgreSQL、無料枠の保存・期限・バックアップ制約 |
| ソースコード | GitHub | `coin-up/seoinage-potato` |
| QR入口 | Renderが発行するHTTPS URL | 3つのQR入口URLへドメインを設定 |

## `package.json`の実行契約

| 項目 | 値 |
|---|---|
| Build Command | `pnpm build` |
| Start Command | `pnpm start` |
| DB反映 | `pnpm db:push` |
| Node | Renderの現行Node.js LTS |
| Port | Renderが注入する`PORT`を使用。固定しない |

`pnpm db:push`はDrizzleマイグレーションを生成してPostgreSQLへ適用します。既存データがある環境で実行する場合は、先にバックアップを取得してください。

## Renderでの登録手順

### 1. アカウント作成

[Render Dashboard](https://dashboard.render.com/)を開き、Google、GitHub、またはメールでアカウントを作成します。パスワードや認証コードはチャットへ送らず、Render画面だけで入力してください。

### 2. PostgreSQLを作成

Dashboardで **New → Postgres** を選択します。無料のインスタンスタイプが選べる場合はFreeを選択し、リージョンはWeb Serviceと同じ地域にします。作成後、接続情報の **Internal Database URL** または **External Database URL** を確認します。Render内のWeb Serviceから接続する場合は、通常はInternal Database URLを`DATABASE_URL`へ登録します。接続文字列は秘密情報なので共有しません。

Render Free Postgresは30日後に期限が来る制約、1GB容量、バックアップ非対応などがあるため、文化祭の短期利用向けです。期限や保存条件は作成時のDashboard表示を優先してください。[1]

### 3. Web Serviceを作成

Dashboardで **New → Web Service** を選択し、GitHubの`coin-up/seoinage-potato`を接続します。設定は次のとおりです。

| Render設定 | 値 |
|---|---|
| Language | Node |
| Branch | `main` |
| Root Directory | 空欄 |
| Build Command | `pnpm build` |
| Start Command | `pnpm start` |
| Instance Type | Free |
| Auto-Deploy | On Commit（任意） |

### 4. 環境変数を登録

Web Serviceの **Environment** で、少なくとも次を登録します。Renderが自動設定する`PORT`は手入力しません。

| 変数 | 値・用途 |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Render PostgresのInternal Database URL |
| `JWT_SECRET` | 十分に長いランダムな秘密値 |
| `VITE_APP_TITLE` | `谷口の背負い投げポテト｜受付管理` |
| Manus OAuth関連 | READMEの環境変数一覧にある値を、利用する場合のみ登録 |
| Manus組み込みAPI関連 | READMEの環境変数一覧にある値を、利用する場合のみ登録 |

`DATABASE_URL`と`JWT_SECRET`はSecretとして扱い、GitHub、QRコード、チャットへ貼り付けません。`VITE_`で始まる値はブラウザへ埋め込まれるため、秘密鍵を入れないでください。保存後は **Save, rebuild, and deploy** を選択します。[3]

### 5. 初回スキーマ反映

Web Serviceのデプロイが成功した後、RenderのShellが利用できる有料構成であれば、Shellで次を実行します。

```bash
pnpm db:push
```

Render Free Web ServiceではDashboard Shellが利用できない場合があります。その場合は、ローカルで同じPostgreSQLの`DATABASE_URL`を一時的に設定して`pnpm db:push`を実行するか、RenderのPre-Deploy Commandに`pnpm db:push`を設定します。実際の無料枠で利用できる機能をDashboard表示で確認し、秘密情報は端末の環境変数として扱ってください。

### 6. HTTPSドメイン

デプロイが成功したら、Web ServiceのSettingsから公開URLを確認します。Renderは`onrender.com`のHTTPS URLを提供します。URLが表示されない場合は、**Settings → Custom Domains**または公開URLの設定を確認してください。Render FreeでもTLSとカスタムドメインがサポートされています。[1]

## QR入口URL

本番ドメインを`https://<renderのドメイン>`とした場合、QR入口は次の3つです。

```text
https://<renderのドメイン>/buyer-only-x5k9m2a7q8r3
https://<renderのドメイン>/admin-b4n6p1j9w2e8
https://<renderのドメイン>/buyer-a7k9m2x5q8r3
```

順に参加者用、管理者用、購入・管理両用です。`/buyer`、`/admin`、`/combined`を直接開いても、QRセッションがなければ機能ページは利用できません。管理者QRはスタッフだけで保管してください。

## 本番確認

本番確認では、次の順にテストします。テスト番号は実注文と区別できる未使用番号を使い、完了後にそのテスト行だけ削除します。既存データがある場合は、全件初期化を実行しません。

1. RenderのBuild／Deployログで`pnpm build`と`pnpm start`が成功したことを確認します。
2. 公開HTTPS URLのトップでQR専用入口が表示されることを確認します。
3. 参加者QRから入り、未使用のテスト番号を登録します。
4. 管理者QRを別端末で開き、未対応一覧へ反映されることを確認します。
5. 検索、対応済み移動、対応済み一覧を確認します。
6. 両用ページの初期化確認ダイアログでキャンセルが機能することを確認します。
7. テストデータだけを削除し、責任者と一覧を確認します。
8. 文化祭開始前に一度Web Serviceへアクセスしてスリープ復帰を確認し、バックアップ手順を実施します。

## 無料運用の注意

Render公式はFreeインスタンスを本番アプリに使わないよう案内しています。Free Web Serviceは15分間通信がないと停止し、再アクセス時に起動待ちが発生します。Free Postgresには期限・容量・バックアップの制限があります。[1] そのため、この構成は「費用をかけずに短期間の文化祭で試す」用途であり、停止しないことや長期保存を保証する構成ではありません。受付中は参加者・管理者の端末から定期的に画面を開き、障害時は[`文化祭当日バックアップ・障害時運用.md`](./文化祭当日バックアップ・障害時運用.md)へ切り替えます。

## References

[1]: https://render.com/docs/free "Deploy for Free — Render Docs"
[2]: https://render.com/docs/deploy-node-express-app "Deploy a Node Express App on Render"
[3]: https://render.com/docs/configure-environment-variables "Environment Variables and Secrets — Render Docs"
[4]: https://render.com/docs/postgresql-creating-connecting "Create and Connect to Render Postgres — Render Docs"
