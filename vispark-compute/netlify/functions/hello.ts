import type { Context } from "@netlify/functions"

export default async (req: Request, context: Context) => {
  const payload = {
    timestamp: new Date().toISOString(),
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
