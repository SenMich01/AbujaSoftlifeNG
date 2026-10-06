# AbujaSoftlifeNG

React/Vite + Node/Express + Supabase Abuja life-simulation MVP.

## Run
npm install
npm run build
npm start

For real authentication/persistence, add SUPABASE_URL and SUPABASE_ANON_KEY and run supabase/schema.sql in Supabase SQL Editor.

## Render
Build command: npm install && npm run build
Start command: npm start
Health check: /api/health
Set SUPABASE_URL and SUPABASE_ANON_KEY in Render environment variables.

The app uses a single Render web service and serves the built React frontend from Express.
