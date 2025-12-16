# Base44 Q&A Chat

A Hebrew-first chat interface for querying Base44 community knowledge via Pinecone Assistant.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Pinecone credentials:

```env
PINECONE_API_KEY=pc-xxxxxxxx
PINECONE_ASSISTANT_NAME=base44-qa
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment (Vercel)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `PINECONE_API_KEY`
   - `PINECONE_ASSISTANT_NAME`
4. Deploy!

## Tech Stack

- **Next.js 15** - React framework
- **Tailwind CSS** - Styling
- **Pinecone Assistant** - Q&A retrieval
- **TypeScript** - Type safety

## Features

- RTL Hebrew support
- Mobile responsive
- Real-time chat interface
- Secure API key handling (server-side only)
