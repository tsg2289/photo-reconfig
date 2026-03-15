# Photo Reconfig

Batch process product images for Amazon, Walmart, and Target. Converts JPEGs to retailer-specific dimensions and formats, with optional AI background removal.

## Features

- **3-step workflow:** Drop images → Select retailers → Process & download
- **Platform specs:** Amazon (2000×2000, 5:6 portrait), Walmart (2200×2200), Target (2400×2400)
- **Main + secondary:** First image = main; all images get secondary variants
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
2. **Select retailers** – Toggle Amazon, Walmart, Target (multi-select).
3. **Process** – Click "Process & Download ZIP". A ZIP downloads with folders per retailer (`amazon/main/`, `amazon/secondary/`, etc.).

## Platform specifications

| Platform | Main | Secondary |
|----------|------|-----------|
| Amazon   | 2000×2000, 1:1, white bg | 2000×2000 square, 1600×1920 portrait |
| Walmart  | 2200×2200, 1:1 | Same |
| Target   | 2400×2400, 1:1 | Same |

## Deploy to Vercel

1. Push to GitHub and import in Vercel.
2. Add `REMOVEBG_API_KEY` in Project → Settings → Environment Variables.
3. Deploy.
