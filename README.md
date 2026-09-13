# 構想群 Kōsōgun — 額縁研究

「額縁」をテーマにした3人（K / H / N）の共同リサーチ。写真・テキスト・リンクのスクラップをWebサイトに並べていく。

- サイト: https://da-unch.github.io/kosogun/
- 投稿画面（CMS）: https://da-unch.github.io/kosogun/admin/

---

## 使い方（投稿する人向け）

### 投稿する
1. `/admin/` を開き「Sign In with GitHub」→ 自分のGitHubアカウントでログイン（初回だけ「Authorize」）
2. 左のコレクションから自分の頭文字（K / H / N）を選んで新規作成
3. タイトル・日付・画像（複数可）・リンク（複数可）・本文を入れて **Publish**
4. 数十秒〜数分でトップに反映。新しい投稿は自動で先頭に並ぶ

### 並び順を変える
1. `/admin/` →「並び順」→「タイルの並び順」
2. 各行のつまみ（＝）をドラッグして並べ替え → **Publish**

- 追加・削除の操作は不要（投稿の追加・削除・タイトル変更は自動で反映）
- 開いたまま時間が経つと保存時に「古い」と言われる → 再読み込みしてからやり直す
- 反映されないときはブラウザを再読み込み（Mac: Cmd+Shift+R）

---

## 現状の仕様（2026-09-13時点）

### サイトの見た目
- 全員の投稿を混ぜた Pinterest風のタイル表示（マソンリー）。グレー背景・細いゴシック・すりガラス風のぼかし
- タイル: 1枚目の写真（写真がなければ本文冒頭の文字タイル）／タイトル／投稿者の頭文字アイコン／日付。複数画像・リンクは右上のチップで件数表示
- 詳細ページ: 画像カルーセル（スワイプ・矢印キー）／本文／リンク一覧／下に「More posts」
- ヘッダー: 左上に公式ロゴ（`assets/images/kosogun_logo.svg`）、右上に Post ボタン（`/admin/` へ）
- **個人名はサイトに出さない**。フォルダ名・URL・アイコンは頭文字（K / H / N）のみ

### 技術構成
- GitHub Pages + Jekyll。`main` へのpushで GitHub Actions がビルドし、`gh-pages` ブランチから配信
- CMS は Sveltia CMS（`admin/`）。保存すると `main` に直接コミットされる
- ログインは「Sign In with GitHub」。Cloudflare Workers 上の `sveltia-cms-auth` が GitHub OAuth を中継
  - Worker: `https://sveltia-cms-auth.hoda-camel.workers.dev`（管理者 K の Cloudflare アカウント。コードは `da-unch/sveltia-cms-auth`）
  - GitHub OAuth App「Kosogun CMS」（da-unch 所有）。Worker の環境変数 `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `ALLOWED_DOMAINS=da-unch.github.io`
  - 投稿できるのはこのリポジトリの Collaborator（書き込み権限あり）だけ

### ファイル構成
| パス | 役割 |
| --- | --- |
| `K/` `H/` `N/` | 各自の投稿（Markdown）。`title` があるものだけサイトに出る |
| `_data/order.yml` | タイルの並び順（CMSの並び順ページ）。自動でも更新される |
| `assets/images/` | CMSでアップした画像・ロゴ |
| `index.html` | トップページ |
| `_layouts/default.html` | 全ページ共通の枠（ヘッダー等） |
| `_includes/feed.html` | 並び順の計算 |
| `_includes/card.html` / `post.html` / `posts.html` | タイル / 詳細ページ / 投稿一覧の収集 |
| `assets/css/style.css` / `assets/js/app.js` | 見た目 / タイル配置・カルーセル |
| `admin/config.yml` | CMSの設定（入力欄・並び順ページ・ログイン） |
| `_config.yml` | Jekyll設定（メンバーの頭文字、サイトに出さないファイル） |
| `.github/workflows/deploy.yml` | 本番ビルド（`main` へのpush時） |
| `.github/workflows/pr-preview.yml` | PRごとのプレビュー |
| `.github/workflows/sync-order.yml` + `.github/scripts/sync_order.rb` | 並び順の自動更新 |
| `議事録/` `CLAUDE.md` `AI掲示板.md` `README.md` | 内部資料。サイトには出ない（ただしリポジトリ自体は公開） |

### 投稿ファイルの中身
```yaml
---
title: R-K01          # 必須。投稿番号もタイトルに入れる運用
date: 2026-09-13T12:00:00
layout: default
images:               # 任意・複数可。1枚目がタイルの写真
  - /assets/images/xxx.jpg
links:                # 任意・複数可
  - https://example.com/
---
本文（任意）
```

### 並び順の仕組み
- `_data/order.yml` の上から順にタイルを表示。リストにない投稿は先頭に新しい順
- `sync-order` ワークフローが `main` へのpushごとに投稿と突き合わせ、新しい投稿を先頭に追加・消えた投稿を除去・タイトルを更新する（`github-actions[bot]` がコミット）

### サイトの見た目・仕組みを変えるとき
1. ブランチを切る → 変更して push → `main` への Pull Request を作成
2. 数分でPRにプレビューURL（`/kosogun/pr-preview/pr-番号/`）が付く。スマホからも確認できる
3. 問題なければ Merge → 本番に反映、プレビューは自動で片付く

- 本番とプレビューのデプロイが同時に走ってぶつかったら、30秒待って1回再試行する
- 注意: 本番デプロイは `gh-pages` の既存ファイルを残す設定（`keep_files`）。サイトから消したいファイルは `gh-pages` からも手で削除する

---

## 更新履歴

### 2026-09-13
- 投稿一覧のリンク切れを修正（ビルド時に baseurl を指定）— #2
- Pinterest風のタイル表示に全面リニューアル（詳細ページ・カルーセル・グレースケール・ぼかし）— #3
- 公式ロゴに差し替え、タイルの投稿番号表示を削除、詳細画像の高さを画像に合わせる — #4
- CMSに「並び順」ページを追加し、タイルの順番を手動で決められるように — #5
- CMSに「Sign In with GitHub」でログインできるように（Cloudflare Worker経由。トークン発行が不要に）— #6
- 本番とプレビューのデプロイ衝突時に再試行 — #7
- 新しい投稿を並び順に自動追加、並び順ページをドラッグだけの画面に — #8
- 個人名を非公開に：フォルダを K / H / N に変更（URLも変更）、投稿者表示を頭文字アイコンのみに、トップの紹介文を削除、内部資料をサイトの公開対象から除外 — #9
- `gh-pages` から公開をやめた内部資料と旧フォルダ名のページを削除

## 検討メモ
- リポジトリ自体は公開のため、GitHub上ではコミット履歴などから氏名が見える。気になる場合はリポジトリの非公開化を検討（GitHub Pages を非公開リポジトリで使うには有料プランが必要）
