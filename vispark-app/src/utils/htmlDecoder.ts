/**
 * Decode HTML entities in a string
 * Converts HTML entities like & to their corresponding characters
 */
export function decodeHtmlEntities(text: string): string {
  // Create a temporary textarea element to leverage the browser's built-in HTML decoding
  const textarea = document.createElement("textarea")
  textarea.innerHTML = text
  return textarea.value
}

/**
 * Safely decode HTML entities, handling null/undefined values
 */
export function safeDecodeHtmlEntities(
  text: string | null | undefined,
): string {
  if (!text) return ""
  return decodeHtmlEntities(text)
}
