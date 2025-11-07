type RetryOptions = {
  maxRetries?: number
  baseDelay?: number
}

export const useRetryWithBackoff = () => {
  const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> => {
    const { maxRetries = 3, baseDelay = 1000 } = options
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt === maxRetries) {
          throw lastError
        }

        // Calculate exponential backoff delay: baseDelay * 2^attempt + jitter
        const delay = baseDelay * 2 ** attempt + Math.random() * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  return { retryWithBackoff }
}
