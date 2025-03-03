# 募集要項自動生成システム

ヒアリング内容を元に生成AIを活用して最適な募集要項を自動作成するシステムです。職種ごとに異なるテンプレートを用意し、各項目を個別に編集することも可能です。

## 主な機能

### 1. ヒアリング管理

- ヒアリング内容の記録・閲覧
- 業種ごとのヒアリング項目管理

### 2. テンプレート管理

- 職種別テンプレート作成・編集
- テンプレートのセクション管理
- プロンプトテンプレートのカスタマイズ

### 3. 生成AI設定

- 複数のAIプロバイダー対応（OpenAI、Anthropic、Gemini）
- APIキーやパラメータの設定
- デフォルトプロバイダー選択

### 4. 募集要項生成

- ヒアリング内容からの自動生成
- 項目ごとの個別再生成
- セクション内容の編集
- テキスト出力機能

## 技術スタック

- **フロントエンド**
  - Next.js: 15.1.3
  - React: 19.0.0
  - TypeScript: 5.0.0
  - Tailwind CSS: 3.4.17
  - shadcn/ui: 2.1.8

- **バックエンド**
  - Node.js: 20.0.0
  - SQLite: 3.0.0
  - Prisma ORM: 5.0.0
  - REST API

## システム設計

### データベース設計

- **AIProvider**: 生成AIの設定情報
- **Industry**: 業種マスタ
- **HearingItem**: ヒアリング項目
- **HearingSession**: ヒアリングセッション
- **Response**: ヒアリング回答
- **JobTemplate**: 職種別テンプレート
- **JobTemplateSection**: テンプレートのセクション定義
- **JobDescription**: 生成された募集要項
- **JobDescriptionSection**: 募集要項の各セクション

### API設計

- **/api/ai-providers**: AI設定の管理
- **/api/hearings**: ヒアリングの管理
- **/api/job-templates**: テンプレートの管理 
- **/api/job-descriptions**: 募集要項の管理

### コンポーネント設計

- 再利用可能なUIコンポーネント
- 状態管理は主にReact hooksで実装
- レスポンシブデザイン対応
- アクセシビリティ配慮

## 使用方法

1. ヒアリング情報を入力
2. 募集要項生成ページで職種テンプレートを選択
3. 生成AIを使って募集要項を自動生成
4. 必要に応じて各セクションを編集
5. 完成した募集要項をテキスト出力

## インストール

```bash
# パッケージのインストール
npm install

# Prismaのセットアップ
npx prisma generate
npx prisma db push

# 開発サーバーの起動
npm run dev
```

## ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。
