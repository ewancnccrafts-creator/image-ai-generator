# ForgeStudio

A self-hosted image preparation studio for laser engraving and CNC carving. It includes a browser workspace, AI generation hooks, background removal, grayscale, posterize, resize/format operations, transforms, sharpening, upscaling, batch APIs, and downloadable output files.

## Run locally

```bash
npm install
cp .env.example .env
# Add OPENAI_API_KEY and/or REPLICATE_API_TOKEN to .env for AI features
npm start
```

Open http://localhost:3000. The browser UI works for local image operations without an AI key. AI features require the provider keys in `.env`.

## Download / deploy

Download the repository from GitHub with **Code → Download ZIP**, or clone it:

```bash
git clone https://github.com/ewancnccrafts-creator/image-ai-generator.git
cd image-ai-generator
npm install
npm start
```

For internet access, deploy this Node app to a host that supports Node.js (Render, Railway, Fly.io, or your own VPS), set the environment variables from `.env.example`, and use the provided public URL.

## Important

- Never commit `.env` or API keys.
- Generated/output files are intentionally ignored by Git and served from `/outputs` while the server is running.
- AI provider APIs can change; keep provider model/version IDs current before production use.
