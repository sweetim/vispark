import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};

const buildHeaders = (): HeadersInit => ({
  ...corsHeaders,
  ...jsonHeaders,
});

type TranscriptSegment = {
  text: string;
  duration?: number;
  offset?: number;
};

type SummaryRequestPayload = {
  transcripts: TranscriptSegment[];
};

type SummarySuccessResponse = {
  bullets: string[];
};

type SummaryErrorResponse = {
  error: string;
  message: string;
};

type SummaryResponseBody = SummarySuccessResponse | SummaryErrorResponse;

const respondWith = (body: SummaryResponseBody, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  });

const extractTranscriptText = (
  payload: SummaryRequestPayload,
): string | null => {
  const segments = Array.isArray(payload?.transcripts)
    ? payload.transcripts
    : null;

  if (!Array.isArray(segments) || segments.length === 0) return null;

  const parts: string[] = [];
  for (const seg of segments) {
    if (seg && typeof seg.text === "string") {
      const trimmed = seg.text.trim();
      if (trimmed.length > 0) parts.push(trimmed);
    }
  }

  if (parts.length === 0) return null;

  // Collapse whitespace to keep token count minimal
  return parts.join(" ").replace(/\s+/g, " ").trim();
};

const summarizeWithOpenAI = async ({
  transcriptText,
  apiKey,
  model,
}: {
  transcriptText: string;
  apiKey: string;
  model: string;
}): Promise<string[]> => {
  const body = {
    model,
    temperature: 1.0,
    response_format: { type: "json_object" as const },
    messages: [
      {
        role: "system",
        content:
          "You are an expert note-taker. Summarize transcripts into clear, concise bullet points that capture key ideas, decisions, actions, numbers, and takeaways. Avoid filler.",
      },
      {
        role: "user",
        content:
          `Summarize the following transcript into 5–12 precise bullet points. Return a JSON object with a single field "bullets" of type string[]. Do not include any additional fields.\n\nTranscript:\n${transcriptText}`,
      },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI request failed (${res.status}): ${errText}`);
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data?.choices?.[0]?.message?.content ?? "";
  let bullets: string[] | null = null;

  // Try parsing as JSON first
  try {
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.bullets)) {
      bullets = parsed.bullets.map((x: unknown) => String(x)).filter(Boolean);
    }
  } catch {
    // ignore, will try fallback
  }

  // Fallback: split by lines and normalize if model didn't return JSON
  if (!bullets) {
    bullets = content
      .split("\n")
      .map((l) => l.replace(/^\s*[-*•]\s*/, "").trim())
      .filter((l) => l.length > 0);
  }

  if (bullets.length === 0) {
    throw new Error("OpenAI returned an empty summary.");
  }

  return bullets;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respondWith(
      {
        error: "Method Not Allowed",
        message: "Only POST is supported.",
      },
      405,
    );
  }

  let payload: SummaryRequestPayload;
  try {
    payload = await req.json();
  } catch {
    return respondWith(
      {
        error: "Invalid JSON",
        message: "Request body must be valid JSON.",
      },
      400,
    );
  }

  const transcriptText = extractTranscriptText(payload);
  if (!transcriptText) {
    return respondWith(
      {
        error: "Missing fields",
        message:
          "The request body must include transcripts as an array of segments with a 'text' field.",
      },
      400,
    );
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return respondWith(
      {
        error: "Server misconfiguration",
        message:
          "OPENAI_API_KEY is not set. Configure it in your environment before calling this function.",
      },
      500,
    );
  }

  const model = "gpt-5-nano";

  try {
    const bullets = await summarizeWithOpenAI({
      transcriptText,
      apiKey,
      model,
    });

    return respondWith(
      {
        bullets,
      },
      200,
    );
  } catch (error) {
    console.error("Failed to summarize transcript:", error);
    const message = error instanceof Error
      ? error.message
      : "Unable to generate summary.";
    return respondWith(
      {
        error: "Summary generation failed",
        message,
      },
      502,
    );
  }
});
