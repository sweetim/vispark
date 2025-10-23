# VISPARK

Transform YouTube content into actionable insights with AI-powered analysis.

VISPARK is a powerful web application that extracts summaries, identifies trends, and generates insights from YouTube videos, helping you stay informed without watching every upload.

## Features

- **AI-Powered Summaries**: Transform hours of content into concise, actionable insights with advanced AI technology
- **Video Transcripts**: Fetch and display complete transcripts for any YouTube video
- **Trend Detection**: Identify emerging topics and patterns across multiple channels to stay ahead of the curve
- **Instant Processing**: Get summaries and insights in seconds, not hours
- **Multi-Language Support**: Analyze content in multiple languages with accurate transcription
- **Secure & Private**: Your data is encrypted and secure with user authentication
- **History Tracking**: Keep track of all your analyzed videos and summaries
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Ant Design + Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Edge Functions)
- **State Management**: Zustand
- **Routing**: React Router v7
- **Icons**: Phosphor Icons
- **PWA**: Progressive Web App capabilities

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- YouTube Data API v3 key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vispark-app.git
cd vispark-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add the following variables:
```
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase:
   - Create a new project in Supabase
   - Run the migration script in `supabase/migrations/`
   - Set up the Edge Functions in `supabase/functions/`

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/           # Reusable UI components
├── config/              # Configuration files
├── hooks/               # Custom React hooks
├── modules/             # Feature modules (auth, nav, common)
├── routes/              # Page components and routing
│   ├── app/             # Protected application routes
│   │   └── vispark/     # VISPARK-specific pages
│   └── ...
├── services/            # API service functions
└── assets/              # Static assets

supabase/
├── functions/           # Edge Functions
│   ├── transcript/      # YouTube transcript fetching
│   ├── summary/         # AI-powered summarization
│   └── vispark/         # VISPARK data management
└── migrations/          # Database schema
```

## Key Pages

- **Landing Page**: Marketing page with feature highlights and pricing
- **Search**: Search for YouTube videos by ID
- **Video Page**: View video metadata, transcripts, and AI-generated summaries
- **Summaries**: Browse all your saved summaries
- **Authentication**: Login and signup pages

## API Services

### YouTube Data API
- Fetches video metadata (title, channel, thumbnails)
- Requires a YouTube Data API v3 key

### Supabase Edge Functions
- `transcript`: Fetches video transcripts using youtube-transcript-plus
- `summary`: Generates AI-powered summaries using GPT
- `vispark`: Manages user's saved VISPARK entries

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please contact support@vispark.xyz or visit our documentation at https://vispark.xyz/docs.
