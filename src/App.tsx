import { useState } from 'react'
import { createPublicClient, http, parseAbi, encodeFunctionData, Address } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from '@zerodev/sdk'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless'
import { bundlerActions } from 'permissionless'
import { LogEntry, AccountData } from './types'
import InputForm from './components/InputForm'
import MintButton from './components/MintButton'
import AccountInfo from './components/AccountInfo'
import LogViewer from './components/LogViewer'
import Footer from './components/Footer'
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

function App() {
  const [privateKey, setPrivateKey] = useState('')
  const [zerodevRpc, setZerodevRpc] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [accountData, setAccountData] = useState<AccountData | null>(null)

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { type, message }])
  }

  const clearLogs = () => {
    setLogs([])
    setAccountData(null)
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
      setAccountData({ address: account.address, nftBalance: '' })
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
      setAccountData({ address: account.address, nftBalance: finalBalance.toString() })
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
          <InputForm
            privateKey={privateKey}
            zerodevRpc={zerodevRpc}
            isLoading={isLoading}
            onPrivateKeyChange={setPrivateKey}
            onZerodevRpcChange={setZerodevRpc}
          />

          <MintButton
            isLoading={isLoading}
            disabled={isLoading || !privateKey || !zerodevRpc}
            onClick={mintNFT}
          />

          <AccountInfo accountData={accountData} />
        </div>

        <LogViewer logs={logs} onClear={clearLogs} />

        <Footer />
      </div>
    </div>
  )
}

export default App
