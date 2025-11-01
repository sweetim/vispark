# GitHub Secrets for Supabase Deployment

To use the GitHub Action workflow for deploying to Supabase, you need to configure the following secrets in your GitHub repository:

## Required Secrets

1. **SUPABASE_ACCESS_TOKEN**
   - Your personal access token for Supabase
   - How to get: Go to [Supabase Dashboard](https://app.supabase.com/account/tokens) and generate a new token

2. **SUPABASE_PROJECT_ID**
   - The reference ID of your Supabase project
   - How to get: Found in your Supabase project settings under "API" or in the project URL

3. **OPENAI_API_KEY**
   - Your OpenAI API key for the summary function
   - How to get: Create an API key at [OpenAI Platform](https://platform.openai.com/api-keys)

4. **YOUTUBE_API_KEY**
   - Your YouTube Data API v3 key for the channel function
   - How to get: Create a key at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

5. **SUPADATA_API_KEY**
   - Your Supadata API key for the transcript function
   - How to get: Sign up at [Supadata](https://supadata.ai/) to get an API key

## How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" in the left sidebar
4. Click on "Actions"
5. Click "New repository secret"
6. Add each of the secrets listed above

## Workflow Triggers

The workflow will automatically run when:
- Code is pushed to the `main` or `master` branch
- Manually triggered from the "Actions" tab in GitHub

## What the Workflow Does

1. Sets up the Node.js environment with the latest LTS version
2. Installs project dependencies
3. Sets up the Supabase CLI
4. Links to your Supabase project
5. Deploys database migrations
6. Deploys all Supabase functions with their environment variables
