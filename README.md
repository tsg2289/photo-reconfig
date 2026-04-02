# Photo Reconfig

Batch process product images for Amazon. Converts JPEGs to Amazon-specific dimensions and formats, with optional AI background removal.

## Features

- **3-step workflow:** Drop images → Select retailer → Process & download
- **Platform specs:** Image 1 (main) 2048×2560; Images 2–6: 1600×1600
- **Main + secondary:** First image = main; all images get secondary variants
- **Background-aware processing:** Real-environment shots fill the frame; white studio shots can keep white background
- **AI background removal:** Optional remove.bg integration for pure white backgrounds
- **Apple Glassmorphism UI:** Clean, frosted-glass design

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

Add your remove.bg API key to `.env.local`:

```
REMOVEBG_API_KEY=your_api_key_here
```

Get a key at [remove.bg/dashboard](https://www.remove.bg/dashboard) (50 free calls/month). You can run without it by disabling "Use AI background removal" in the app.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Drop images** – Drag and drop or click to browse. JPEG, PNG, WebP supported. First image = main product shot.
2. **Select retailer** – Amazon (default).
3. **Process** – Click "Process & Download ZIP". A ZIP downloads with one folder per retailer (`amazon/`, `funboy/`, etc.).

## Platform specifications

| Image | Dimensions |
|-------|------------|
| Image 1 (main) | 2048×2560 |
| Images 2–6 | 1600×1600 |

## Deploy to Vercel

1. Push to GitHub and import in Vercel.
2. Add `REMOVEBG_API_KEY` in Project → Settings → Environment Variables.
3. Deploy.
