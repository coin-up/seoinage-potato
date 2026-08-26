# GitHubリポジトリからの本番デプロイ手順

## 結論

このプロジェクトは、GitHub Pagesではなく、**Node.jsの常駐WebサービスとMySQLを提供できるサーバー**へGitHubリポジトリからデプロイしてください。最も少ない変更で動かしやすい構成は、Railway上に「Node.js Web Service」と「MySQL Service」を同じプロジェクトで作る構成です。RailwayはGitHubリポジトリからのデプロイとMySQLサービスを公式に提供しています。[1] [2]

RenderのWeb ServiceでもExpressアプリをGitHubからデプロイできますが、現在のアプリはMySQLを必要とするため、MySQLを別途用意して`DATABASE_URL`を設定する必要があります。[3] [4]

## 推奨構成

| 役割 | サービス | 必要条件 |
|---|---|---|
| Webアプリ | Railway Web Service | Node.js、GitHub自動デプロイ、公開HTTPS、環境変数、SSE接続維持 |
| データベース | Railway MySQL Service | MySQL接続情報をWeb Serviceへ参照渡し |
| ソースコード | GitHub公開リポジトリ | `coin-up/seoinage-potato` |
| 公開URL | Railwayが発行するHTTPSドメイン | QR入口URLのドメイン部分をこのURLへ置換 |

GitHub Pagesは静的ファイル配信が中心で、Express、tRPC、MySQL、SSE、QRセッションを実行できません。このアプリは`package.json`の`build`でViteのフロントエンドとExpressサーバーの両方をビルドし、`start`でNodeサーバーを起動する構成です。

## `package.json`の実行契約

現在のスクリプトは次のとおりです。

| 項目 | 現在のコマンド | デプロイ設定 |
|---|---|---|
| 開発 | `NODE_ENV=development tsx watch server/_core/index.ts` | 本番では使用しない |
| ビルド | `vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist` | Build Commandに`pnpm build`を指定 |
| 起動 | `NODE_ENV=production node dist/index.js` | Start Commandに`pnpm start`を指定 |
| テスト | `vitest run` | 公開前またはCIで実行 |
| DB反映 | `drizzle-kit generate && drizzle-kit migrate` | 初回DB作成時だけ実行し、既存データへ慎重に適用 |

`PORT`はプラットフォームが設定する値を使うため、サーバー側で固定しないでください。現在のサーバーエントリポイントは`process.env.PORT`を読み取り、未設定時だけ開発用の既定値を使用します。

## Railwayでの具体的な手順

### 1. GitHubリポジトリを準備する

GitHub上で`coin-up/seoinage-potato`が公開リポジトリになっていることを確認します。`.env`、秘密鍵、データベース接続文字列、実データをコミットしないでください。現在のプロジェクトは環境変数から秘密情報を受け取る設計です。

### 2. RailwayでNodeサービスを作成する

Railwayへログインし、Dashboardで**New Project → Deploy from GitHub repo**を選び、`coin-up/seoinage-potato`を選択します。デプロイ設定は次のようにします。

| Railway設定 | 値 |
|---|---|
| Root Directory | 空欄（リポジトリ直下） |
| Build Command | `pnpm build` |
| Start Command | `pnpm start` |
| Node環境 | `package.json`の`engines`指定がないため、プラットフォームの現行Node LTSを選択 |
| 公開ポート | Railwayが注入する`PORT`を使用 |
| 公開ネットワーク | Generate DomainでHTTPSドメインを発行 |

初回デプロイは環境変数が不足すると画面やAPIが正常動作しないため、デプロイログを確認してから公開ドメインを発行します。Railway公式手順でも、GitHubリポジトリを選択してDeploy Nowを実行し、デプロイ後にGenerate Domainで公開ドメインを作成する流れになっています。[1]

### 3. RailwayでMySQLを作成する

同じProject Canvasで**New → Database → MySQL**を追加します。MySQLサービスには`MYSQLHOST`、`MYSQLPORT`、`MYSQLUSER`、`MYSQLPASSWORD`、`MYSQLDATABASE`、`MYSQL_URL`などが用意されます。[2]

Web ServiceのVariablesで、少なくとも次を設定します。

```text
DATABASE_URL=<MySQLサービスのMYSQL_URLの値>
```

同一Railwayプロジェクト内のサービス参照機能が使える場合は、MySQLサービスの`MYSQL_URL`をWeb Serviceの`DATABASE_URL`へ参照設定してください。データベースを外部公開する必要はありません。Web Serviceが同一プロジェクト内で接続する構成にしてください。

### 4. 環境変数を設定する

#### 必須のサーバー設定

| 変数 | 用途 | 設定方針 |
|---|---|---|
| `NODE_ENV` | 本番モード切替 | `production` |
| `DATABASE_URL` | Drizzle/MySQL接続 | MySQLサービスの接続文字列。秘密として登録 |
| `JWT_SECRET` | セッションCookie署名 | ランダムで十分長い秘密値。既存の本番値を再利用するか安全に生成 |
| `PORT` | Webサービス待受ポート | Railway/Renderが自動注入。手動固定しない |

#### OAuth・管理者情報

| 変数 | 用途 |
|---|---|
| `VITE_APP_ID` | Manus OAuthアプリ識別子 |
| `OAUTH_SERVER_URL` | OAuthサーバーのバックエンドURL |
| `VITE_OAUTH_PORTAL_URL` | ブラウザからログイン画面へ移動するURL |
| `OWNER_OPEN_ID` | オーナー判定・管理者権限付与 |
| `OWNER_NAME` | オーナー表示情報 |

#### Manus組み込みAPI・画面設定

| 変数 | 用途 |
|---|---|
| `BUILT_IN_FORGE_API_URL` | サーバー側組み込みAPI URL |
| `BUILT_IN_FORGE_API_KEY` | サーバー側組み込みAPIキー |
| `VITE_FRONTEND_FORGE_API_URL` | フロントエンド組み込みAPI URL |
| `VITE_FRONTEND_FORGE_API_KEY` | フロントエンド用APIキー |
| `VITE_APP_TITLE` | ブラウザタイトル・サイト名 |
| `VITE_APP_LOGO` | サイトロゴ設定。使用時のみ |
| `VITE_ANALYTICS_ENDPOINT` | アクセス解析エンドポイント。使用時のみ |
| `VITE_ANALYTICS_WEBSITE_ID` | アクセス解析サイトID。使用時のみ |

`VITE_`で始まる値はViteのビルド時にフロントエンドへ埋め込まれるため、秘密情報を入れないでください。特に`VITE_FRONTEND_FORGE_API_KEY`は、公開ブラウザへ渡っても問題ない前提のフロントエンド用キーだけを設定します。`JWT_SECRET`、`DATABASE_URL`、`BUILT_IN_FORGE_API_KEY`はサーバー側の秘密として設定します。環境変数はGitHubへ保存せず、RailwayまたはRenderのEnvironment画面へ登録してください。[4]

### 5. 初回データベース反映

MySQLサービスが起動した後、Web ServiceのShellまたは一時的なデプロイコマンドで次を実行します。

```bash
pnpm db:push
```

このプロジェクトの`db:push`は、Drizzleのマイグレーションを生成してからデータベースへ適用します。文化祭本番データが入った後に繰り返し実行したり、初期化操作の代わりに使ったりしないでください。既存データがある場合は、バックアップを取ってから実行してください。

### 6. SSEとQRセッションを確認する

このアプリは、管理画面から`/api/realtime`へSSE接続し、`text/event-stream`で変更イベントを受け取ります。Web Serviceは静的ホスティングではなく、NodeプロセスがHTTP接続を処理できる構成にしてください。リバースプロキシやアイドルタイムアウトがSSE接続を途中で切る場合は、アプリの短時間自動再接続・再取得がフォールバックとして機能します。

QR入口は`/api/qr/access`でサーバー側のQRトークンを検証し、HttpOnly Cookieを発行します。HTTPSで公開し、CookieのSecure条件を満たしてください。公開ドメインが決まったら、既存QR入口のドメイン部分だけを本番ドメインへ置き換えます。

```text
https://<本番ドメイン>/buyer-only-x5k9m2a7q8r3
https://<本番ドメイン>/buyer-a7k9m2x5q8r3
https://<本番ドメイン>/admin-b4n6p1j9w2e8
```

機能ページの`/buyer`、`/admin`、`/combined`を直接開いた場合は、QRセッションがないため機能ページを利用できません。QRのURL自体を知っている人がアクセスできる点は、静的QR運用の制約です。管理者QRはスタッフだけで保管してください。

### 7. 本番確認

次の順に確認します。

1. Railwayのデプロイログで`pnpm build`が成功し、`pnpm start`でNodeサービスが起動していることを確認します。
2. 発行されたHTTPSドメインのルートへアクセスし、QR専用入口が表示されることを確認します。
3. 参加者QR入口から入り、注意事項を読んだ後、テスト用チケット`Z999`を送信します。
4. 管理者QR入口を別端末または別ブラウザで開き、`Z999`が未対応一覧に受付時刻順で表示されることを確認します。
5. 検索欄で`Z99`を検索し、対象が絞り込まれることを確認します。
6. `対応済みにする`を押し、対象が対応済み一覧へ移動することを確認します。
7. 両用ページで初期化確認ダイアログを開き、キャンセルが機能することを確認します。
8. テストデータだけを削除し、文化祭開始前に未対応・対応済みが空であることを責任者と確認します。

## Renderを使う場合

Renderで**New → Web Service**からGitHubリポジトリを接続し、LanguageをNode、Build Commandを`pnpm build`、Start Commandを`pnpm start`にします。Render公式ドキュメントでも、GitHubリポジトリへ接続してBuild CommandとStart Commandを指定する流れが案内されています。[3]

Render DashboardのEnvironmentで上記の環境変数を登録します。Render公式ドキュメントでは、Environment画面から変数を登録し、Save, rebuild, and deployまたはSave and deployを選ぶ運用が案内されています。[4] MySQLは別サービスで用意し、Render Web Serviceの`DATABASE_URL`へTLS対応の接続文字列を設定してください。SSEを文化祭で安定運用するには、アイドル切断やスリープの影響を確認してください。

## 推奨判断

**コード変更なしを最優先するなら、RailwayのNode Web Service + Railway MySQL Serviceが第一候補**です。GitHubからの自動デプロイ、同一プロジェクト内のMySQL、環境変数参照、公開HTTPSを一つの管理画面で構成しやすいためです。Renderでも可能ですが、MySQLの配置と接続設定を別途用意する必要があります。

GitHubリポジトリの公開とWebサイトの本番公開は別です。GitHubはソースコードの保管場所であり、RailwayまたはRenderがNodeサーバー、SSE、API、データベース接続を実行する場所です。

## References

[1]: https://docs.railway.com/quick-start "Quick Start Tutorial — Railway Docs"
[2]: https://docs.railway.com/databases/mysql "MySQL — Railway Docs"
[3]: https://render.com/docs/deploy-node-express-app "Deploy a Node Express App on Render"
[4]: https://render.com/docs/configure-environment-variables "Environment Variables and Secrets — Render Docs"
