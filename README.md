# SEO診断Webアプリケーション

Webサイトの SEO 状況を総合的に分析・診断する React SPA + Express API フルスタックアプリケーション

## 🌟 特徴

- **包括的なSEO分析**: メタ情報、コンテンツ、技術面を総合評価
- **リアルタイム診断**: URL入力から数秒で詳細レポート生成
- **日本語対応**: UI・メッセージが完全日本語対応
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **本番運用対応**: Render クラウドプラットフォームで稼働中

## 🏗️ アーキテクチャ

```
seo-audit-webapp/
├── server.js         # 本番用統合サーバー
├── backend/          # Express API (開発時: Port 3000)
│   └── src/
│       ├── api/      # REST API エンドポイント
│       ├── services/ # SEO分析エンジン
│       └── middleware/
├── frontend/         # React SPA (開発時: Port 3001)
│   └── src/
│       ├── components/
│       ├── services/  # API通信層
│       └── styles/
└── render.yaml       # Render デプロイ設定
```

## 🛠️ 技術スタック

### Backend
- **Express.js**: REST API サーバー
- **Node-fetch**: HTTP リクエスト処理
- **Cheerio**: HTML DOM 解析
- **CORS & Security**: セキュリティヘッダー設定

### Frontend
- **React**: SPA フロントエンド
- **Axios**: API 通信
- **Bootstrap 5**: レスポンシブ UI
- **React Hooks**: 状態管理

### DevOps
- **Render**: クラウドデプロイメント
- **Git**: バージョン管理
- **npm**: パッケージ管理

## 🚀 クイックスタート

### 開発環境セットアップ
```bash
# リポジトリクローン
git clone https://github.com/Fumiaki0604/seo-audit-webapp.git
cd seo-audit-webapp

# 全依存関係インストール
npm run install:all

# 開発サーバー起動（バックエンド・フロントエンド同時）
npm run dev
```

### 本番ビルド・起動
```bash
# 本番ビルド
npm run build

# 本番サーバー起動
npm start
```

## 📡 API エンドポイント

### `POST /api/analyze`
Webサイトの SEO 分析を実行

**リクエスト例:**
```json
{
  "url": "https://example.com",
  "options": {
    "verbose": true,
    "timeout": 30000
  }
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "score": 75,
    "meta": { "score": 80, "issues": [...] },
    "content": { "score": 70, "issues": [...] },
    "technical": { "score": 85, "issues": [...] },
    "issues": [...],
    "loadTime": 1200
  }
}
```

### `GET /health`
サーバーヘルスチェック

### `GET /api/analyze/test`
API動作確認テスト

## 🔍 SEO 分析項目

### メタ情報 (40%)
- タイトルタグ最適化
- メタディスクリプション
- Open Graph タグ
- Canonical URL

### コンテンツ (35%)
- テキスト量・品質
- 見出し構造 (H1-H6)
- 画像 alt 属性
- 内部・外部リンク
- キーワード密度

### 技術面 (25%)
- HTTPS 対応
- ページ表示速度
- モバイル対応
- 構造化データ
- リダイレクト状況

## 🌐 デプロイメント

### Render プラットフォーム
- **URL**: https://seo-audit-webapp.onrender.com
- **自動デプロイ**: main ブランチへの push で自動更新
- **環境変数**: `NODE_ENV=production`

### ローカル本番テスト
```bash
# 本番環境シミュレーション
NODE_ENV=production npm start
```

## 🔧 開発・デバッグ

### バックエンドのみ起動
```bash
cd backend
npm run dev  # nodemon でホットリロード
```

### フロントエンドのみ起動
```bash
cd frontend
npm start    # React 開発サーバー
```

### API テスト
```bash
# ヘルスチェック
curl http://localhost:3000/health

# SEO分析テスト
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 📋 開発状況

- ✅ Express API サーバー構築完了
- ✅ React フロントエンド実装完了
- ✅ SEO 分析エンジン実装完了
- ✅ API 連携・エラーハンドリング完了
- ✅ レスポンシブ UI 実装完了
- ✅ 本番デプロイ・運用開始

## 🤝 コントリビューション

プルリクエストや Issue の投稿を歓迎します。詳細は `CLAUDE.md` をご参照ください。

## 📄 ライセンス

MIT License