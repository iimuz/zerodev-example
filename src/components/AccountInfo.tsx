import './AccountInfo.css'
import { AccountData } from '../types'

interface AccountInfoProps {
  accountData: AccountData | null
}

export default function AccountInfo({ accountData }: AccountInfoProps) {
  if (!accountData) return null

  return (
    <div className="account-info">
      {accountData.address && (
        <div className="info-box">
          <strong>アカウントアドレス:</strong>
          <code>{accountData.address}</code>
        </div>
      )}

      {accountData.nftBalance && (
        <div className="info-box success">
          <strong>NFT残高:</strong>
          <code>{accountData.nftBalance}</code>
        </div>
      )}
    </div>
  )
}
