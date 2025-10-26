import './Footer.css'

const CONTRACT_ADDRESS = '0x34bE7f35132E97915633BC1fc020364EA5134863'

export default function Footer() {
  return (
    <div className="footer">
      <p>
        <strong>使用しているNFTコントラクト:</strong> {CONTRACT_ADDRESS}
      </p>
      <p>
        <strong>ネットワーク:</strong> Sepolia Testnet
      </p>
      <p className="note">
        このサンプルはAccount Abstraction (ERC-4337)を使用して、<br />
        Paymasterによるガスレストランザクションを実現しています。
      </p>
    </div>
  )
}
