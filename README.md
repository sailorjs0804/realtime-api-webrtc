# OpenAI Realtime with WebRTC
This is a WebRTC-based Voice AI stream application using `OpenAI`'s `Realtime API` and `WebRTC`.

## Features
- **Next.js Framework**: Built with Next.js for server-side rendering and API routes.
- **Modern UI**: Animated using Tailwind CSS & Framer Motion & shadcn/ui.
- **Use-WebRTC Hook**: A hook to abstract the OpenAI WebRTC handling.
- **Tool Calling**: 6 example functions to demonstrate client side tools along with Realtime API: `getCurrentTime`, `partyMode`, `changeBackground`, `launchWebsite`, `copyToClipboard`, `scrapeWebsite` (requires FireCrawl API key)
- **Localization**: Select language for app strings and the voice agent (English, Chinese)

  
## Requirements
- **Node.js**
- Azure OpenAI API Key in `.env` file

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/sailorjs0804/realtime-api-webrtc.git
cd realtime-api-webrtc
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL==your-next-api-url
AZURE_OPENAI_API_KEY=your-openai-api-key
AZURE_API_VERSION="2024-10-01-preview"
AZURE_OPENAI_ENDPOINT=your-azure-openai-endpoint
AZURE_DEPLOYMENT_NAME=your-azure-deployment-name
```

### 3. Install Dependencies
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
