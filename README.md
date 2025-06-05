# Text-to-Speech Translator

![Project Demo](day9.gif)

A modern web application built with Next.js 14 that provides real-time text-to-speech translation capabilities. This project combines the power of AI for speech synthesis with a beautiful, responsive user interface.

## Features

- Real-time text-to-speech conversion
- Multiple language support
- Modern, responsive UI built with Tailwind CSS
- Firebase integration for authentication and data storage
- OpenAI/Anthropic integration for enhanced AI capabilities
- Real-time audio transcription using Deepgram

## Demo

![Project Demo](https://via.placeholder.com/800x400?text=Text+to+Speech+Translator+Demo)

*Demo GIF coming soon - currently optimizing for size requirements*

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: Firebase Auth
- **Database**: Firebase Realtime Database
- **Storage**: Firebase Storage
- **AI Integration**: 
  - OpenAI API
  - Anthropic API
  - Replicate API (Stable Diffusion)
- **Audio Processing**: Deepgram API

## Project Structure

```
src/
├── app/
│   ├── api/         # API routes
│   ├── components/  # React components
│   ├── lib/         # Utility functions and hooks
│   └── page.tsx     # Main page
```

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/AirealAce/Text-to-Speech-Translator.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Start the development server
```bash
npm run dev
```

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `REPLICATE_API_TOKEN`
- `DEEPGRAM_API_KEY`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
