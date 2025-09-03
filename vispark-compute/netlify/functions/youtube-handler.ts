import type { Context } from "@netlify/functions"

export default async (req: Request, context: Context) => {
  console.log(req.body)
  console.log(JSON.stringify(context))
  return new Response()
}
