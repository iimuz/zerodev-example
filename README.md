# ZeroDev Account Abstraction Example

このプロジェクトは、ZeroDevのSDKを使用したAccount Abstraction (ERC-4337)のフロントエンドサンプルコードです。

React + Viteで構築されたWebアプリケーションで、ブラウザ上でAccount Abstractionの動作を体験できます。

## 概要

このサンプルでは以下のことを行います：

1. **プライベートキーから署名者を作成**
2. **ECDSA Validatorの作成** - アカウントの検証に使用
3. **Kernel Accountの作成** - スマートコントラクトウォレット
4. **Paymasterの設定** - ガス代のスポンサー機能
5. **NFTのミント** - Account Abstractionを使用したトランザクション実行

すべての処理がブラウザ上で実行され、リアルタイムでログを確認できます。

## 必要な環境

- Node.js (v18以上推奨)
- npm または yarn

## セットアップ

### 1. リポジトリのクローンと依存関係のインストール

```bash
# 依存関係のインストール
npm install
```

### 2. ZeroDev RPC URLの取得

1. [ZeroDev Dashboard](https://dashboard.zerodev.app/)にアクセス
2. アカウントを作成またはログイン
3. 新しいプロジェクトを作成
4. ネットワークとして**Sepolia**を選択
5. 表示されるRPC URLをコピー（後でブラウザUIで使用します）

### 3. テスト用プライベートキーの準備

- テスト用の新しいプライベートキーを生成するか、既存のテストアカウントのキーを使用
- **重要**: 本番環境や実際の資産が入ったウォレットのキーは使用しないでください

## 実行方法

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

### ビルド

```bash
npm run build
```

### プレビュー（ビルド後）

```bash
npm run preview
```

## 使い方

1. **開発サーバーを起動**してブラウザでアクセス
2. **秘密鍵**欄にテスト用の秘密鍵を入力（`0x`で始まる形式）
3. **ZeroDev RPC URL**欄にDashboardで取得したRPC URLを入力
4. **「NFTをミント」ボタン**をクリック
5. 実行ログでトランザクションの進行状況を確認
6. NFTが正常にミントされると、残高が表示されます

## アプリケーションの構成

```
zerodev-example/
├── index.html          # エントリーポイントHTML
├── package.json        # プロジェクト設定
├── tsconfig.json       # TypeScript設定
├── vite.config.ts      # Vite設定
└── src/
    ├── main.tsx        # Reactエントリーポイント
    ├── App.tsx         # メインコンポーネント（ZeroDev統合）
    ├── App.css         # スタイル
    ├── index.css       # グローバルスタイル
    └── vite-env.d.ts   # Vite型定義
```

## コードの説明

### App.tsx の主な機能

1. **Signerの作成** (`privateKeyToAccount`)
   - プライベートキーからEOA（外部所有アカウント）を作成

2. **ECDSA Validatorの作成** (`signerToEcdsaValidator`)
   - スマートアカウントのトランザクションを検証するためのバリデーターを作成

3. **Kernel Accountの作成** (`createKernelAccount`)
   - ERC-4337準拠のスマートコントラクトウォレットを作成
   - ECDSA Validatorをsudoプラグインとして設定

4. **Paymaster Clientの作成** (`createZeroDevPaymasterClient`)
   - ガス代をスポンサーするためのPaymasterクライアントを設定

5. **Kernel Account Clientの作成** (`createKernelAccountClient`)
   - トランザクションを送信するためのクライアントを作成
   - Paymasterと連携してガス代を自動スポンサー

6. **NFTのミント**
   - テストNFTコントラクトにミント関数を呼び出し
   - UserOperationとしてトランザクションを送信
   - トランザクションの完了を待機
   - リアルタイムでログを表示

### UIの特徴

- **リアルタイムログ表示**: トランザクション処理の各ステップをログで確認
- **エラーハンドリング**: エラー発生時は赤色でログに表示
- **レスポンシブデザイン**: モバイルでも使いやすいUI
- **ローディング状態**: 処理中はボタンが無効化され、進行状況を表示

## 使用しているNFTコントラクト

- **ネットワーク**: Sepolia testnet
- **コントラクトアドレス**: `0x34bE7f35132E97915633BC1fc020364EA5134863`
- **関数**:
  - `mint(address _to)` - NFTをミント
  - `balanceOf(address owner)` - NFT残高を確認

## Account Abstractionの利点

- **ガスレストランザクション**: Paymasterによりユーザーはガス代を支払う必要がない
- **バッチトランザクション**: 複数のトランザクションを1つにまとめて実行可能（今後実装可能）
- **セッションキー**: 一時的な権限を持つキーを発行可能（今後実装可能）
- **ソーシャルリカバリー**: 秘密鍵を失っても復元可能（今後実装可能）

## セキュリティに関する注意

このサンプルはデモ目的であり、以下の点に注意してください：

- **秘密鍵を直接入力**: テスト用途のみで使用してください
- **本番環境での使用**: 実際のアプリケーションでは以下を検討してください
  - Passkey認証（WebAuthn）
  - ソーシャルログイン（Google, Twitter等）
  - ハードウェアウォレット連携
  - セキュアなキー管理ソリューション

## 今後の拡張案

- Passkey認証の実装
- ソーシャルログイン統合
- バッチトランザクション機能
- セッションキーの実装
- マルチチェーン対応

## 参考リンク

- [ZeroDev公式ドキュメント](https://docs.zerodev.app/)
- [ZeroDev Tutorial](https://docs.zerodev.app/sdk/getting-started/tutorial)
- [ZeroDev GitHub Examples](https://github.com/zerodevapp/zerodev-examples)
- [ERC-4337仕様](https://eips.ethereum.org/EIPS/eip-4337)
- [Vite公式ドキュメント](https://vitejs.dev/)
- [React公式ドキュメント](https://react.dev/)

## ライセンス

MIT
