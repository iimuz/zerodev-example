import { config } from "dotenv"
import { createPublicClient, http, parseAbi, encodeFunctionData, Address } from "viem"
import { sepolia } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless"
import { bundlerActions } from "permissionless"

// Load environment variables
config()

// Configuration
const entryPoint = ENTRYPOINT_ADDRESS_V07
const kernelVersion = "0.3.0"

// NFT Contract on Sepolia testnet
const contractAddress = "0x34bE7f35132E97915633BC1fc020364EA5134863"
const contractABI = parseAbi([
  "function mint(address _to) public",
  "function balanceOf(address owner) public view returns (uint256)"
])

async function main() {
  // Validate environment variables
  if (!process.env.ZERODEV_RPC) {
    throw new Error("ZERODEV_RPC is not set in .env file")
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set in .env file")
  }

  console.log("🚀 Starting ZeroDev Account Abstraction Example\n")

  // Create public client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  })

  // Step 1: Create a signer from private key
  console.log("📝 Step 1: Creating signer from private key...")
  const signer = privateKeyToAccount(process.env.PRIVATE_KEY as Address)
  console.log(`   Signer address: ${signer.address}\n`)

  // Step 2: Create ECDSA validator
  console.log("🔐 Step 2: Creating ECDSA validator...")
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion
  })
  console.log("   Validator created successfully\n")

  // Step 3: Create Kernel Account
  console.log("🏦 Step 3: Creating Kernel Account...")
  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator
    },
    entryPoint,
    kernelVersion
  })
  console.log(`   Account address: ${account.address}\n`)

  // Step 4: Create Paymaster Client
  console.log("💰 Step 4: Setting up Paymaster (for gas sponsorship)...")
  const paymasterClient = createZeroDevPaymasterClient({
    chain: sepolia,
    transport: http(process.env.ZERODEV_RPC)
  })
  console.log("   Paymaster client created\n")

  // Step 5: Create Kernel Account Client
  console.log("🔧 Step 5: Creating Kernel Account Client...")
  const kernelClient = createKernelAccountClient({
    account,
    chain: sepolia,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    middleware: {
      sponsorUserOperation: paymasterClient.sponsorUserOperation
    }
  })
  console.log("   Client created successfully\n")

  // Step 6: Check initial NFT balance
  console.log("📊 Step 6: Checking initial NFT balance...")
  const initialBalance = await publicClient.readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "balanceOf",
    args: [account.address]
  })
  console.log(`   Initial NFT balance: ${initialBalance}\n`)

  // Step 7: Mint NFT using Account Abstraction
  console.log("🎨 Step 7: Minting NFT to the account...")
  const mintData = encodeFunctionData({
    abi: contractABI,
    functionName: "mint",
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

  console.log(`   UserOperation hash: ${userOpHash}`)
  console.log("   Waiting for transaction to be mined...")

  // Wait for the transaction to be confirmed
  const bundlerClient = kernelClient.extend(bundlerActions(entryPoint))
  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash
  })

  console.log(`   ✅ Transaction mined! Block: ${receipt.receipt.blockNumber}`)
  console.log(`   Transaction hash: ${receipt.receipt.transactionHash}\n`)

  // Step 8: Check final NFT balance
  console.log("📊 Step 8: Checking final NFT balance...")
  const finalBalance = await publicClient.readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "balanceOf",
    args: [account.address]
  })
  console.log(`   Final NFT balance: ${finalBalance}`)
  console.log(`   NFTs minted: ${Number(finalBalance) - Number(initialBalance)}\n`)

  console.log("🎉 Successfully completed ZeroDev Account Abstraction example!")
}

// Run the main function
main()
  .then(() => {
    console.log("\n✨ Script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Error:", error.message)
    process.exit(1)
  })
