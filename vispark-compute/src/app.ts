import "dotenv/config"

import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker"
import { ethers } from "ethers"
import { fetchTranscript } from "youtube-transcript-plus"

;(async () => {
  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai")
  const wallet = new ethers.Wallet(process.env.PRIVATE_WALLET_KEY, provider)
  const address = wallet.address
  const balance = await wallet.provider?.getBalance(address)
  console.log({ balance, address })
  const broker = await createZGComputeNetworkBroker(wallet)
  // await broker.ledger.addLedger(0.01);

  const videoId = "1GjKJ86sHtQ"
  const transcipts = await fetchTranscript(videoId)
  console.log(transcipts.map((item) => item.text))

  const account = await broker.ledger.getLedger()
  console.log(account)

  const services = await broker.inference.listService()
  console.log({ services })

  const providerAddress_llama = "0xf07240Efa67755B5311bc75784a061eDB47165Dd"
  await broker.inference.acknowledgeProviderSigner(providerAddress_llama)
  const { endpoint, model } = await broker.inference.getServiceMetadata(
    providerAddress_llama,
  )
  console.log({ endpoint, model })

  const questions =
    "you are an expert of summarize, please summarize the content below"
  const headers = await broker.inference.getRequestHeaders(
    providerAddress_llama,
    questions,
  )

  console.log({ headers })
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      messages: [
        { role: "system", content: questions },
        {
          role: "user",
          content: transcipts.map((item) => item.text).join(" "),
        },
      ],
      model: model,
    }),
  })

  const data = await response.json()
  const choices = data.choices[0].message
  console.log({ data, choices })

  const valid = await broker.inference.processResponse(
    providerAddress_llama,
    questions,
    data.id,
  )
  console.log({ valid })

  console.log(await broker.ledger.getLedger())

  console.log(`Balance: ${ethers.formatEther(account.availableBalance)} OG`)

  const ledger = await broker.ledger.getLedger()
  console.log(ledger)
  console.log(`
        Balance: ${ethers.formatEther(ledger.availableBalance)} OG
        Locked: ${ethers.formatEther(ledger.totalBalance)} OG
        `)
})()
