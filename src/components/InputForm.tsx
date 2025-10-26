import './InputForm.css'

interface InputFormProps {
  privateKey: string
  zerodevRpc: string
  isLoading: boolean
  onPrivateKeyChange: (value: string) => void
  onZerodevRpcChange: (value: string) => void
}

export default function InputForm({
  privateKey,
  zerodevRpc,
  isLoading,
  onPrivateKeyChange,
  onZerodevRpcChange
}: InputFormProps) {
  return (
    <div className="input-form">
      <div className="form-group">
        <label htmlFor="privateKey">秘密鍵（テスト用のみ）</label>
        <input
          id="privateKey"
          type="password"
          placeholder="0x..."
          value={privateKey}
          onChange={(e) => onPrivateKeyChange(e.target.value)}
          disabled={isLoading}
        />
        <small>警告: 本番環境では秘密鍵を直接入力しないでください</small>
      </div>

      <div className="form-group">
        <label htmlFor="zerodevRpc">ZeroDev RPC URL</label>
        <input
          id="zerodevRpc"
          type="text"
          placeholder="https://rpc.zerodev.app/api/v2/bundler/..."
          value={zerodevRpc}
          onChange={(e) => onZerodevRpcChange(e.target.value)}
          disabled={isLoading}
        />
        <small>
          <a href="https://dashboard.zerodev.app/" target="_blank" rel="noopener noreferrer">
            ZeroDev Dashboard
          </a>
          でSepoliaプロジェクトを作成してRPC URLを取得
        </small>
      </div>
    </div>
  )
}
