# File Transfer

A simple file transfer web app with drag-and-drop upload, QR codes, and 6-digit retrieval codes.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in Vercel
3. Add a Vercel KV database:
   - Go to Storage tab in your Vercel project
   - Create a new KV database
   - Connect it to your project (environment variables will be added automatically)
4. Deploy

## Environment Variables

Vercel KV will automatically add:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

## Local Development

```bash
npm install
npm start
```

Visit http://localhost:3000

Note: Local version uses in-memory storage. Vercel deployment uses KV storage.
