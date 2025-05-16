# OpenAI WebRTC Shadcn Next15 Starter
This is a WebRTC-based Voice AI stream application using `OpenAI`'s `Realtime API` and `WebRTC`. Project contains `/api` route and UI components developed with `Next.js` and `shadcn/ui`. It supports real-time audio conversations implented in [skrivov/openai-voice-webrtc-next](https://github.com/skrivov/openai-voice-webrtc-next) with the addition of a hook to abstract the WebRTC handling.

## Features
- **Next.js Framework**: Built with Next.js for server-side rendering and API routes.
- **Modern UI**: Animated using Tailwind CSS & Framer Motion & shadcn/ui.
- **Use-WebRTC Hook**: A hook to abstract the OpenAI WebRTC handling.
- **Tool Calling**: 6 example functions to demonstrate client side tools along with Realtime API: `getCurrentTime`, `partyMode`, `changeBackground`, `launchWebsite`, `copyToClipboard`, `scrapeWebsite` (requires FireCrawl API key)
- **Localization**: Select language for app strings and the voice agent (English, Spanish, French, Chinese)
- **Type Safety**: TypeScript with strict eslint rules (optional)

  
## Requirements
- **Node.js**
- Azure OpenAI API Key in `.env` file

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/cameronking4/openai-realtime-api-nextjs.git
cd openai-realtime-api-nextjs
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
AZURE_OPENAI_API_KEY=your-openai-api-key
```

### 3. Install Dependencies
If using **Node.js**:
```bash
npm install
```

### 4. Run the Application

#### Using Node.js:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage
1. Open the app in your browser: `http://localhost:3000`.
2. Select a voice and start the audio session.
