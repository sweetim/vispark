import { createClient } from "supabase"

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

type VideoProcessingRequest = {
  video_id: string
  user_id: string
  channel_id: string
}

type TranscriptSegment = {
  text: string
  duration: number
  offset: number
  lang?: string
}

type TranscriptResponse = {
  videoId: string
  transcript: TranscriptSegment[]
  lang?: string
}

type SummaryResponse = {
  bullets: string[]
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceRoleKey = Deno.env.get("NEW_SUPABASE_SERVICE_ROLE_KEY")!

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const { video_id, user_id, channel_id }: VideoProcessingRequest = await req.json()

    if (!video_id || !user_id || !channel_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: video_id, user_id, channel_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    console.log(`Processing video ${video_id} for user ${user_id} from channel ${channel_id}`)

    // Step 1: Generate transcript
    let transcriptResponse: TranscriptResponse
    try {
      const transcriptFunctionUrl = `${supabaseUrl}/functions/v1/transcript`
      const transcriptRes = await fetch(transcriptFunctionUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: video_id,
          local: true // Use local transcript fetching first
        }),
      })

      if (!transcriptRes.ok) {
        throw new Error(`Transcript function failed with status: ${transcriptRes.status}`)
      }

      transcriptResponse = await transcriptRes.json()
      console.log(`Successfully generated transcript for video ${video_id}`)
    } catch (error) {
      console.error(`Failed to generate transcript for video ${video_id}:`, error)

      // Update video_notifications to mark as failed
      await supabase
        .from("video_notifications")
        .update({
          summary_generated: true, // Mark as processed even if failed
          updated_at: new Date().toISOString()
        })
        .eq("video_id", video_id)
        .eq("user_id", user_id)

      return new Response(
        JSON.stringify({
          error: "Failed to generate transcript",
          details: error instanceof Error ? error.message : String(error)
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Step 2: Generate summary from transcript
    let summaryResponse: SummaryResponse
    try {
      const summaryFunctionUrl = `${supabaseUrl}/functions/v1/summary`
      const summaryRes = await fetch(summaryFunctionUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcripts: transcriptResponse.transcript
        }),
      })

      if (!summaryRes.ok) {
        throw new Error(`Summary function failed with status: ${summaryRes.status}`)
      }

      summaryResponse = await summaryRes.json()
      console.log(`Successfully generated summary for video ${video_id}`)
    } catch (error) {
      console.error(`Failed to generate summary for video ${video_id}:`, error)

      // Update video_notifications to mark as failed
      await supabase
        .from("video_notifications")
        .update({
          summary_generated: true, // Mark as processed even if failed
          updated_at: new Date().toISOString()
        })
        .eq("video_id", video_id)
        .eq("user_id", user_id)

      return new Response(
        JSON.stringify({
          error: "Failed to generate summary",
          details: error instanceof Error ? error.message : String(error)
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Step 3: Store summary in visparks table
    try {
      const { error: visparkError } = await supabase
        .from("visparks")
        .insert({
          user_id: user_id,
          video_id: video_id,
          video_channel_id: channel_id,
          summaries: summaryResponse.bullets,
          created_at: new Date().toISOString()
        })

      if (visparkError) {
        throw visparkError
      }

      console.log(`Successfully stored summary in visparks table for video ${video_id}`)
    } catch (error) {
      console.error(`Failed to store summary in visparks table for video ${video_id}:`, error)

      // Update video_notifications to mark as failed
      await supabase
        .from("video_notifications")
        .update({
          summary_generated: true, // Mark as processed even if failed
          updated_at: new Date().toISOString()
        })
        .eq("video_id", video_id)
        .eq("user_id", user_id)

      return new Response(
        JSON.stringify({
          error: "Failed to store summary",
          details: error instanceof Error ? error.message : String(error)
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Step 4: Update video_notifications table to mark summary as generated
    try {
      const { error: updateError } = await supabase
        .from("video_notifications")
        .update({
          summary_generated: true,
          updated_at: new Date().toISOString()
        })
        .eq("video_id", video_id)
        .eq("user_id", user_id)

      if (updateError) {
        throw updateError
      }

      console.log(`Successfully updated video_notifications for video ${video_id}`)
    } catch (error) {
      console.error(`Failed to update video_notifications for video ${video_id}:`, error)
      // Don't return error here since the main processing is complete
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Video processing completed successfully",
        video_id,
        summary_count: summaryResponse.bullets.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  } catch (error) {
    console.error("Error in video processing function:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})
