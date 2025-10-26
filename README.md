# ZeroDev Account Abstraction Example

このプロジェクトは、ZeroDevのSDKを使用したAccount Abstraction (ERC-4337)のシンプルなサンプルコードです。

## 概要

このサンプルでは以下のことを行います：

1. **プライベートキーから署名者を作成**
2. **ECDSA Validatorの作成** - アカウントの検証に使用
3. **Kernel Accountの作成** - スマートコントラクトウォレット
4. **Paymasterの設定** - ガス代のスポンサー機能
5. **NFTのミント** - Account Abstractionを使用したトランザクション実行

## 必要な環境

- Node.js (v18以上推奨)
- npm または yarn

## セットアップ

### 1. リポジトリのクローンと依存関係のインストール

```bash
# 依存関係のインストール
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして、必要な値を設定します：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
# ZeroDev RPC URL
# https://dashboard.zerodev.app/ でプロジェクトを作成してRPC URLを取得
# ネットワークはSepoliaを選択してください
ZERODEV_RPC=https://rpc.zerodev.app/api/v2/bundler/YOUR_PROJECT_ID

# テスト用のプライベートキー（本番環境では使用しないでください）
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### 3. ZeroDev RPCの取得方法

1. [ZeroDev Dashboard](https://dashboard.zerodev.app/)にアクセス
2. アカウントを作成またはログイン
3. 新しいプロジェクトを作成
4. ネットワークとして**Sepolia**を選択
5. 表示されるRPC URLをコピーして`.env`の`ZERODEV_RPC`に設定

### 4. テスト用プライベートキーの準備

- テスト用の新しいプライベートキーを生成するか、既存のテストアカウントのキーを使用
- **重要**: 本番環境や実際の資産が入ったウォレットのキーは使用しないでください

## 実行方法

```bash
npm start
```

または

```bash
npm run dev
```

## コードの説明

### main関数の流れ

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

## 使用しているNFTコントラクト

- **ネットワーク**: Sepolia testnet
- **コントラクトアドレス**: `0x34bE7f35132E97915633BC1fc020364EA5134863`
- **関数**:
  - `mint(address _to)` - NFTをミント
  - `balanceOf(address owner)` - NFT残高を確認

## Account Abstractionの利点

- **ガスレストランザクション**: Paymasterによりユーザーはガス代を支払う必要がない
- **バッチトランザクション**: 複数のトランザクションを1つにまとめて実行可能
- **セッションキー**: 一時的な権限を持つキーを発行可能
- **ソーシャルリカバリー**: 秘密鍵を失っても復元可能

## 参考リンク

- [ZeroDev公式ドキュメント](https://docs.zerodev.app/)
- [ZeroDev Tutorial](https://docs.zerodev.app/sdk/getting-started/tutorial)
- [ZeroDev GitHub Examples](https://github.com/zerodevapp/zerodev-examples)
- [ERC-4337仕様](https://eips.ethereum.org/EIPS/eip-4337)

## ライセンス

MIT
