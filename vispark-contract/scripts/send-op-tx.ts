import { network } from "hardhat"
import { formatEther } from "viem"

const { viem } = await network.connect({
  network: "0g-testnet",
  chainType: "l1",
})

const publicClient = await viem.getPublicClient()
const [senderClient] = await viem.getWalletClients()

publicClient
  .getBalance({
    address: senderClient.account.address,
  })
  .then((amount) => {
    console.log(`amount = ${formatEther(amount)}`)
  })

// console.log("Sending 1 wei from", senderClient.account.address, "to itself")
// const l1Gas = await publicClient.estimateL1Gas({
//   account: senderClient.account.address,
//   to: senderClient.account.address,
//   value: 1n,
// });

// console.log("Estimated L1 gas:", l1Gas);

// console.log("Sending L2 transaction");
// const tx = await senderClient.sendTransaction({
//   to: senderClient.account.address,
//   value: 1n,
// });

// await publicClient.waitForTransactionReceipt({ hash: tx });

// console.log("Transaction sent successfully");
