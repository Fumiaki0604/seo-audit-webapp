# SEO Audit Web Application

React SPA + Express API による SEO 診断ツールのWebアプリ版

## アーキテクチャ

```
seo-audit-webapp/
├── backend/          # Express API Server (Port 3000)
│   ├── src/
│   │   ├── api/      # API Routes
│   │   ├── services/ # SEO Analysis Logic
│   │   └── middleware/
│   └── package.json
├── frontend/         # React SPA (Port 3001)
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
└── README.md
```

## 技術スタック

### Backend
- **Express.js**: REST API サーバー
- **Node-fetch**: HTTP リクエスト
- **Cheerio**: HTML 解析
- **CORS**: クロスオリジン対応
- **Helmet**: セキュリティ

### Frontend (予定)
- **React**: UI フレームワーク
- **Axios**: API 通信
- **Bootstrap**: CSS フレームワーク

## API エンドポイント

### `POST /api/analyze`
SEO分析を実行

```json
{
  "url": "https://example.com",
  "options": {
    "verbose": true,
    "timeout": 10000
  }
}
```

### `GET /api/analyze/test`
API動作確認

### `GET /health`
サーバーヘルスチェック

## 開発

### Backend サーバー起動
```bash
cd backend
npm install
npm run dev  # 開発モード (nodemon)
npm start    # 本番モード
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

## 次のステップ

1. ✅ Express API サーバー構築
2. ⏳ React フロントエンド構築
3. ⏳ API 連携実装
4. ⏳ UI/UX 改善