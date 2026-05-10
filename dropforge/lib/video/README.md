# Video pipeline — HyperFrames worker

Tom (Video Producer) écrit des briefs vidéo qui peuvent être traduits
en HTML pour [HyperFrames](https://github.com/heygen-com/hyperframes),
qui rend du HTML→MP4 via Puppeteer + FFmpeg.

## Pourquoi ce n'est pas dans Vercel

Une fonction Vercel serverless n'est pas faite pour ça :

| Contrainte | Vercel | HyperFrames |
|---|---|---|
| Size limit fonction | ~50 MB | Chromium ≈ 170 MB |
| Runtime | Node 18-20 | Node ≥ 22 |
| Binaires natifs | non | ffmpeg requis |
| Cold start | OK pour API | ❌ trop lent pour render |

→ on délègue à un **worker dédié**.

## Architecture cible

```
Agent Tom (Vercel)
   │ HTML composition générée par sa run()
   ▼
POST /api/video/render          (route à créer Sprint 4)
   │ persist job dans Supabase.video_jobs
   ▼
Supabase queue
   │ (poll 1×/30s)
   ▼
Worker container               (Railway / Fly / VPS)
   ├─ Node 22 + FFmpeg + Chromium
   ├─ npm install hyperframes
   ├─ pull pending job
   ├─ run hyperframes render <composition>.html → out.mp4
   ├─ upload S3 / Supabase Storage
   └─ update job status=done, video_url
```

## Setup minimal worker (Railway exemple)

```bash
# Dockerfile
FROM node:22-bookworm
RUN apt-get update && apt-get install -y ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["node", "worker.js"]
```

```js
// worker.js (squelette)
const { createClient } = require("@supabase/supabase-js");
const hyperframes = require("hyperframes"); // une fois publié sur npm

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function loop() {
  while (true) {
    const { data: jobs } = await sb.from("video_jobs")
      .select("*").eq("status", "queued").order("created_at").limit(1);
    if (jobs?.length) {
      const job = jobs[0];
      try {
        await sb.from("video_jobs").update({ status: "rendering" }).eq("id", job.id);
        const out = await hyperframes.render(job.composition, { data: job.data });
        const url = await uploadToStorage(out);
        await sb.from("video_jobs").update({ status: "done", video_url: url }).eq("id", job.id);
      } catch (e) {
        await sb.from("video_jobs").update({ status: "failed", error: String(e) }).eq("id", job.id);
      }
    } else {
      await new Promise(r => setTimeout(r, 30_000));
    }
  }
}
loop();
```

## État actuel

- ✅ Stub `lib/video/hyperframes.ts` exposé pour Tom et Kai
- ✅ Tom mentionne HyperFrames dans son system prompt (composants, prompts)
- ⏳ Worker container : à provisionner Sprint 4 (après premières ventes)
- ⏳ Table `video_jobs` à ajouter dans une migration Supabase quand on enclenche

En l'état, `submitRender()` et `pollRender()` retournent des stubs
si `HYPERFRAMES_WORKER_URL` n'est pas configuré. Tom peut donc livrer
ses briefs sans bloquer le reste du système.
