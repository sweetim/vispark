import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker"
import type { Context } from "@netlify/functions"
import { ethers } from "ethers"
import { fetchTranscript } from "youtube-transcript-plus"

type ChatCompletionResponse = {
  id: string
  object: string
  created: number
  model: string
  choices: Choice[]
  usage: Usage
  prompt_logprobs: null | unknown
}

type Choice = {
  index: number
  message: Message
  logprobs: null | unknown
  finish_reason: string | null
  stop_reason: string | null
}

type Message = {
  role: "assistant" | "user" | "system"
  reasoning_content: string | null
  content: string
  tool_calls: string[]
}

type Usage = {
  prompt_tokens: number
  total_tokens: number
  completion_tokens: number
  prompt_tokens_details: null | string
}

export default async (_req: Request, context: Context) => {
  const videoId = context.url.searchParams.get("video-id")

  console.log(`Processing video ID: ${videoId}`)

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

  const broker = await createZGComputeNetworkBroker(wallet)

  // const { fetchTranscript } = await import("youtube-transcript-plus")
  const transcripts = await fetchTranscript(videoId)
  const concatTranscripts = transcripts.map((item) => item.text).join(" ")

  const providerAddress_llama = "0xf07240Efa67755B5311bc75784a061eDB47165Dd"
  await broker.inference.acknowledgeProviderSigner(providerAddress_llama)
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

  const data: ChatCompletionResponse = await response.json()
  const result = data.choices[0]?.message.content

  return new Response(
    JSON.stringify({
      id: data.id,
      result,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
      },
    },
  )
}
