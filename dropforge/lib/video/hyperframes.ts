/**
 * HyperFrames integration stub — Tom's video rendering primitive.
 *
 * HyperFrames (https://github.com/heygen-com/hyperframes) transforme un
 * fichier HTML en MP4 via Puppeteer + FFmpeg. Apache 2.0, $0/rendu,
 * déterministe.
 *
 * ⚠️ Ne tourne PAS dans une route Vercel serverless :
 *   - Puppeteer = Chromium (~170 MB) > 50 MB serverless function size limit
 *   - FFmpeg = binaire natif, à preinstaller sur le système
 *
 * → Pattern à utiliser :
 *
 *     [Vercel route Next.js]                    [Worker dédié]
 *     POST /api/video/render            ───►    Container Docker
 *     ↓ (push job en queue)                     ou Railway/Fly worker
 *     Job queue (Supabase / Redis)              avec Node ≥22 + FFmpeg
 *                                       ◄───    + npm i hyperframes
 *                                                (poll queue, render, upload S3)
 *
 * Cette interface est l'enrobage que les agents (Tom, Kai) appellent.
 * En dev / sans worker, on retourne un stub qui décrit ce qui aurait été
 * rendu. La queue réelle sera branchée Sprint 4.
 */

export interface HyperFramesJob {
  jobId: string;
  composition: string;       // chemin ou inline HTML
  durationSec: number;
  aspectRatio: "9:16" | "16:9" | "1:1" | "4:5" | "2:3";
  fps?: number;
  outputFormat?: "mp4" | "webm";
  data?: Record<string, unknown>; // variables injectées dans le HTML
}

export interface HyperFramesJobResult {
  jobId: string;
  status: "queued" | "rendering" | "done" | "failed";
  videoUrl?: string;
  durationMs?: number;
  errorMessage?: string;
}

/**
 * Submit a render job. En production, push dans la queue Supabase qui sera
 * pollée par le worker. En dev, retourne un stub immédiatement.
 */
export async function submitRender(job: Omit<HyperFramesJob, "jobId">): Promise<HyperFramesJobResult> {
  const jobId = `hf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // TODO Sprint 4 : push vers Supabase video_jobs table + worker poll.
  // Pour l'instant : stub mode.
  if (!process.env.HYPERFRAMES_WORKER_URL) {
    return {
      jobId,
      status: "queued",
      errorMessage:
        "HyperFrames worker non configuré (HYPERFRAMES_WORKER_URL absent). " +
        "Le brief Tom est livré, le rendu sera exécuté quand le worker sera up.",
    };
  }

  // Mode worker actif : delegate au service externe (Railway, Fly, ...).
  try {
    const res = await fetch(`${process.env.HYPERFRAMES_WORKER_URL}/render`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.HYPERFRAMES_WORKER_KEY ? { "x-worker-key": process.env.HYPERFRAMES_WORKER_KEY } : {}),
      },
      body: JSON.stringify({ jobId, ...job }),
    });
    if (!res.ok) {
      return { jobId, status: "failed", errorMessage: `Worker returned ${res.status}` };
    }
    const json = (await res.json()) as Partial<HyperFramesJobResult>;
    return { jobId, status: json.status ?? "queued", videoUrl: json.videoUrl, durationMs: json.durationMs };
  } catch (err) {
    return {
      jobId,
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "worker unreachable",
    };
  }
}

/**
 * Poll a job status. Pareil : si pas de worker, retourne un stub.
 */
export async function pollRender(jobId: string): Promise<HyperFramesJobResult> {
  if (!process.env.HYPERFRAMES_WORKER_URL) {
    return { jobId, status: "queued", errorMessage: "Worker non configuré." };
  }
  try {
    const res = await fetch(`${process.env.HYPERFRAMES_WORKER_URL}/jobs/${jobId}`, {
      headers: process.env.HYPERFRAMES_WORKER_KEY ? { "x-worker-key": process.env.HYPERFRAMES_WORKER_KEY } : {},
    });
    if (!res.ok) return { jobId, status: "failed", errorMessage: `Worker returned ${res.status}` };
    return (await res.json()) as HyperFramesJobResult;
  } catch (err) {
    return { jobId, status: "failed", errorMessage: err instanceof Error ? err.message : "worker unreachable" };
  }
}
