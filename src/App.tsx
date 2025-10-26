import { useState } from 'react'
import { createPublicClient, http, parseAbi, encodeFunctionData, Address } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from '@zerodev/sdk'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless'
import { bundlerActions } from 'permissionless'
import './App.css'

// Configuration
const entryPoint = ENTRYPOINT_ADDRESS_V07
const kernelVersion = '0.3.0' as const

// NFT Contract on Sepolia testnet
const contractAddress = '0x34bE7f35132E97915633BC1fc020364EA5134863'
const contractABI = parseAbi([
  'function mint(address _to) public',
  'function balanceOf(address owner) public view returns (uint256)'
])

interface LogEntry {
  type: 'info' | 'success' | 'error'
  message: string
}

function App() {
  const [privateKey, setPrivateKey] = useState('')
  const [zerodevRpc, setZerodevRpc] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [accountAddress, setAccountAddress] = useState('')
  const [nftBalance, setNftBalance] = useState<string>('')

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { type, message }])
  }

  const clearLogs = () => {
    setLogs([])
    setAccountAddress('')
    setNftBalance('')
  }

  const mintNFT = async () => {
    if (!privateKey || !zerodevRpc) {
      addLog('error', '秘密鍵とZeroDev RPCを入力してください')
      return
    }

    setIsLoading(true)
    clearLogs()

    try {
      addLog('info', 'ZeroDev Account Abstractionを開始します...')

      // Create public client
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http()
      })

      // Step 1: Create signer
      addLog('info', 'ステップ 1: 署名者を作成中...')
      const signer = privateKeyToAccount(privateKey as Address)
      addLog('success', `署名者のアドレス: ${signer.address}`)

      // Step 2: Create ECDSA validator
      addLog('info', 'ステップ 2: ECDSA Validatorを作成中...')
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint,
        kernelVersion
      })
      addLog('success', 'Validator作成完了')

      // Step 3: Create Kernel Account
      addLog('info', 'ステップ 3: Kernel Accountを作成中...')
      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator
        },
        entryPoint,
        kernelVersion
      })
      setAccountAddress(account.address)
      addLog('success', `アカウントアドレス: ${account.address}`)

      // Step 4: Create Paymaster Client
      addLog('info', 'ステップ 4: Paymasterを設定中（ガススポンサー）...')
      const paymasterClient = createZeroDevPaymasterClient({
        chain: sepolia,
        transport: http(zerodevRpc)
      })
      addLog('success', 'Paymasterクライアント作成完了')

      // Step 5: Create Kernel Account Client
      addLog('info', 'ステップ 5: Kernel Account Clientを作成中...')
      const kernelClient = createKernelAccountClient({
        account,
        chain: sepolia,
        bundlerTransport: http(zerodevRpc),
        middleware: {
          sponsorUserOperation: paymasterClient.sponsorUserOperation
        }
      })
      addLog('success', 'クライアント作成完了')

      // Step 6: Check initial balance
      addLog('info', 'ステップ 6: 初期NFT残高を確認中...')
      const initialBalance = await publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'balanceOf',
        args: [account.address]
      })
      addLog('info', `初期NFT残高: ${initialBalance.toString()}`)

      // Step 7: Mint NFT
      addLog('info', 'ステップ 7: NFTをミント中...')
      const mintData = encodeFunctionData({
        abi: contractABI,
        functionName: 'mint',
        args: [account.address]
      })

      const userOpHash = await kernelClient.sendUserOperation({
        userOperation: {
          callData: await account.encodeCallData({
            to: contractAddress,
            value: BigInt(0),
            data: mintData
          })
        }
      })

      addLog('info', `UserOperation Hash: ${userOpHash}`)
      addLog('info', 'トランザクションの承認を待機中...')

      // Wait for confirmation
      const bundlerClient = kernelClient.extend(bundlerActions(entryPoint))
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash
      })

      addLog('success', `トランザクション承認完了！ブロック: ${receipt.receipt.blockNumber}`)
      addLog('success', `トランザクションハッシュ: ${receipt.receipt.transactionHash}`)

      // Step 8: Check final balance
      addLog('info', 'ステップ 8: 最終NFT残高を確認中...')
      const finalBalance = await publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'balanceOf',
        args: [account.address]
      })

      const minted = Number(finalBalance) - Number(initialBalance)
      setNftBalance(finalBalance.toString())
      addLog('success', `最終NFT残高: ${finalBalance.toString()}`)
      addLog('success', `ミントされたNFT: ${minted}`)
      addLog('success', 'ZeroDev Account Abstraction完了！')

    } catch (error) {
      addLog('error', `エラー: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>ZeroDev Account Abstraction</h1>
        <p className="subtitle">React + Vite フロントエンドサンプル</p>

        <div className="card">
          <div className="form-group">
            <label htmlFor="privateKey">秘密鍵（テスト用のみ）</label>
            <input
              id="privateKey"
              type="password"
              placeholder="0x..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
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
              onChange={(e) => setZerodevRpc(e.target.value)}
              disabled={isLoading}
            />
            <small>
              <a href="https://dashboard.zerodev.app/" target="_blank" rel="noopener noreferrer">
                ZeroDev Dashboard
              </a>
              でSepoliaプロジェクトを作成してRPC URLを取得
            </small>
          </div>

          <button
            onClick={mintNFT}
            disabled={isLoading || !privateKey || !zerodevRpc}
            className="mint-button"
          >
            {isLoading ? 'ミント中...' : 'NFTをミント'}
          </button>

          {accountAddress && (
            <div className="info-box">
              <strong>アカウントアドレス:</strong>
              <code>{accountAddress}</code>
            </div>
          )}

          {nftBalance && (
            <div className="info-box success">
              <strong>NFT残高:</strong>
              <code>{nftBalance}</code>
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="logs-container">
            <div className="logs-header">
              <h3>実行ログ</h3>
              <button onClick={clearLogs} className="clear-button">クリア</button>
            </div>
            <div className="logs">
              {logs.map((log, index) => (
                <div key={index} className={`log-entry log-${log.type}`}>
                  <span className="log-icon">
                    {log.type === 'success' ? '✓' : log.type === 'error' ? '✗' : 'ℹ'}
                  </span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="footer">
          <p>
            <strong>使用しているNFTコントラクト:</strong> {contractAddress}
          </p>
          <p>
            <strong>ネットワーク:</strong> Sepolia Testnet
          </p>
          <p className="note">
            このサンプルはAccount Abstraction (ERC-4337)を使用して、<br />
            Paymasterによるガスレストランザクションを実現しています。
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
