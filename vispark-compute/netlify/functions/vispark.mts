import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker"
import type { Context } from "@netlify/functions"
import { ethers } from "ethers"
import { fetchTranscript } from "youtube-transcript-plus"

export default async (req: Request, context: Context) => {
  const { videoId } = context.params

  if (!videoId) {
    return new Response(
      JSON.stringify({
        error: "Missing videoId in request body",
      }),
      {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      },
    )
  }

  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai")
  const wallet = new ethers.Wallet(process.env.PRIVATE_WALLET_KEY, provider)

  const broker = await createZGComputeNetworkBroker(
    wallet as unknown as Parameters<typeof createZGComputeNetworkBroker>[0],
  )

  const transcripts = await fetchTranscript(videoId)
  const concatTranscripts = transcripts.map((item) => item.text).join(" ")

  const providerAddress_llama = "0xf07240Efa67755B5311bc75784a061eDB47165Dd"
  // await broker.inference.acknowledgeProviderSigner(providerAddress_llama)
  const { endpoint, model } = await broker.inference.getServiceMetadata(
    providerAddress_llama,
  )

  const questions =
    "you are an expert of summarize, please summarize the content below"

  const headers = await broker.inference.getRequestHeaders(
    providerAddress_llama,
    questions,
  )

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: questions,
        },
        {
          role: "user",
          content: concatTranscripts,
        },
      ],
      model: model,
    }),
  })

  const data = await response.json()
  const choices = data?.choices?.[0]?.message

  return new Response(
    JSON.stringify({
      data,
      choices,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    },
  )
}
