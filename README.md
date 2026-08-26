# 谷口の背負い投げポテト｜受付管理

文化祭で利用するQRコード専用のフライドポテト注文受付・管理Webアプリです。参加者はQRチケットから受付番号を送信し、スタッフは管理画面で未対応・対応済みの受付を確認できます。

## 構成

- フロントエンド: React + TypeScript + Vite
- サーバー: Node.js + Express + tRPC
- データベース: MySQL + Drizzle ORM
- リアルタイム反映: Server-Sent Events（SSE）と自動再取得
- QRアクセス: サーバー検証済みのHttpOnlyセッションCookie

GitHub Pagesなどの静的ホスティングだけでは、Express、tRPC、MySQL、SSE、QRセッションは動作しません。Node.js Web ServiceとMySQLを提供するホスティングへデプロイしてください。

## ローカル起動

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm start
```

開発時は次を使用します。

```bash
pnpm dev
```

## 本番デプロイ

GitHub連携に対応したNode.js Web Serviceへリポジトリを接続し、次のコマンドを設定します。

| 設定 | 値 |
|---|---|
| Build Command | `pnpm build` |
| Start Command | `pnpm start` |
| Node | 現行Node.js LTS |
| Port | ホスティングサービスが注入する`PORT`を使用 |

MySQLサービスを同じプロジェクト、またはTLS接続可能な外部サービスへ用意し、接続文字列を`DATABASE_URL`へ設定します。初回のスキーマ反映は、バックアップを確認してから次を実行します。

```bash
pnpm db:push
```

## 環境変数

サーバー側で設定する主な値は次のとおりです。秘密値は`.env`やGitHubへコミットせず、ホスティングサービスのSecret／Environment画面へ登録してください。

| 変数 | 用途 |
|---|---|
| `NODE_ENV` | 本番では`production` |
| `DATABASE_URL` | MySQL接続文字列 |
| `JWT_SECRET` | セッションCookie署名用の秘密値 |
| `PORT` | ホスティングサービスが自動注入 |
| `VITE_APP_ID` | Manus OAuthアプリ識別子 |
| `OAUTH_SERVER_URL` | OAuthバックエンドURL |
| `VITE_OAUTH_PORTAL_URL` | OAuthログイン画面URL |
| `OWNER_OPEN_ID` | オーナー／管理権限判定 |
| `OWNER_NAME` | オーナー情報 |
| `BUILT_IN_FORGE_API_URL` | サーバー側組み込みAPI URL |
| `BUILT_IN_FORGE_API_KEY` | サーバー側組み込みAPIキー |
| `VITE_FRONTEND_FORGE_API_URL` | フロントエンド組み込みAPI URL |
| `VITE_FRONTEND_FORGE_API_KEY` | フロントエンド用APIキー |
| `VITE_APP_TITLE` | ブラウザタイトル・サイト名 |
| `VITE_APP_LOGO` | ロゴ設定。使用時のみ |
| `VITE_ANALYTICS_ENDPOINT` | 解析エンドポイント。使用時のみ |
| `VITE_ANALYTICS_WEBSITE_ID` | 解析サイトID。使用時のみ |

`VITE_`で始まる値はブラウザへ埋め込まれるため、秘密情報を設定しないでください。`DATABASE_URL`、`JWT_SECRET`、`BUILT_IN_FORGE_API_KEY`は必ずサーバー側のSecretとして扱います。

## QR入口

本番ドメインを`https://<本番ドメイン>`とした場合、入口は次の3つです。

```text
https://<本番ドメイン>/buyer-only-x5k9m2a7q8r3
https://<本番ドメイン>/admin-b4n6p1j9w2e8
https://<本番ドメイン>/buyer-a7k9m2x5q8r3
```

順に参加者用、管理者用、購入・管理両用です。機能ページの`/buyer`、`/admin`、`/combined`へ直接アクセスしても、QRセッションがない場合は利用できません。管理者用QRはスタッフだけで管理してください。

## 当日の使い方

参加者はQRチケットを読み取り、注意事項を読んでから、英字1文字＋3桁番号（例: `A123`）を入力して受付します。注文は来店の10〜15分前を目安に行い、揚げる時間により多少前後する場合があります。

スタッフは管理者QRから入り、未対応一覧を受付時刻の古い順に確認します。検索欄でチケット番号を絞り込み、商品を渡したら対応ボタンを押して対応済みへ移します。両用ページでは受付と管理を同じ画面で操作できます。

全データ初期化は両用ページの確認ダイアログから実行できます。文化祭開始前や終了後など、責任者が確認した場合だけ使用してください。実データのバックアップなしに初期化しないでください。

## バックアップ・障害時運用

文化祭当日のDBバックアップ、紙による受付継続、重複注文防止、復旧後の照合、復元・初期化の判断は、[`文化祭当日バックアップ・障害時運用.md`](./文化祭当日バックアップ・障害時運用.md)にまとめています。障害中は同じチケット番号を再送信せず、責任者が紙リストと画面を照合してから未登録分だけを1件ずつ反映してください。

## 確認コマンド

```bash
pnpm check
pnpm test
pnpm build
```

SSEが接続できない環境でも、自動再取得によって一覧の更新を補完します。ただし、Nodeサービス、API、MySQL、HTTPSがすべて利用可能であることが前提です。

## 詳細手順

外部ホスティングの具体的な設定、Railway／Renderの構成、SSEとQRセッションの注意点は、リポジトリ内の[`GitHubからのデプロイ手順.md`](./GitHubからのデプロイ手順.md)を参照してください。
