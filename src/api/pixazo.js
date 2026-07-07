const BASE_URL = 'https://gateway.pixazo.ai';

function headers(apiKey) {
  const h = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': apiKey,
  };
  return h;
}

// ─── Sync: Flux Image ──────────────────────────────────────────────
export async function generateFluxImage(apiKey, params) {
  const res = await fetch(`${BASE_URL}/flux-1-schnell/v1/getData`, {
    method: 'POST',
    headers: { ...headers(apiKey), 'Cache-Control': 'no-cache' },
    body: JSON.stringify({
      prompt: params.prompt,
      num_steps: params.num_steps ?? 4,
      seed: params.seed ?? Math.floor(Math.random() * 2147483647),
      height: params.height ?? 1024,
      width: params.width ?? 1024,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flux API error (${res.status}): ${text}`);
  }
  return res.json(); // { output: "https://...png" }
}

// ─── Sync: SDXL Image ──────────────────────────────────────────────
export async function generateSDXLImage(apiKey, params) {
  const res = await fetch(`${BASE_URL}/getImage/v1/getSDXLImage`, {
    method: 'POST',
    headers: { ...headers(apiKey), 'Cache-Control': 'no-cache' },
    body: JSON.stringify({
      prompt: params.prompt,
      negative_prompt: params.negative_prompt ?? '',
      height: params.height ?? 1024,
      width: params.width ?? 1024,
      num_steps: params.num_steps ?? 20,
      guidance_scale: params.guidance_scale ?? 5,
      seed: params.seed ?? Math.floor(Math.random() * 2147483647),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SDXL API error (${res.status}): ${text}`);
  }
  return res.json(); // { imageUrl: "..." }
}

// ─── Async: LTX Img→Video ──────────────────────────────────────────
export async function startLtxImgToVideo(apiKey, params) {
  const res = await fetch(`${BASE_URL}/ltx-video/v1/image-to-video`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      prompt: params.prompt,
      image_url: params.image_url,
      strength: params.strength ?? 1.0,
      seed: params.seed ?? 42,
      aspect: params.aspect ?? 'auto',
      width: params.width ?? 1280,
      height: params.height ?? 704,
      num_frames: params.num_frames ?? 121,
      frame_rate: params.frame_rate ?? 24,
      enhance_prompt: params.enhance_prompt ?? false,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LTX Img→Video API error (${res.status}): ${text}`);
  }
  return res.json(); // { request_id, status, polling_url }
}

// ─── Async: LTX Txt→Video ──────────────────────────────────────────
export async function startLtxTextToVideo(apiKey, params) {
  const res = await fetch(`${BASE_URL}/ltx-video/v1/text-to-video`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      prompt: params.prompt,
      seed: params.seed ?? 42,
      aspect: params.aspect ?? 'auto',
      width: params.width ?? 1280,
      height: params.height ?? 704,
      num_frames: params.num_frames ?? 121,
      frame_rate: params.frame_rate ?? 24,
      enhance_prompt: params.enhance_prompt ?? false,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LTX Txt→Video API error (${res.status}): ${text}`);
  }
  return res.json(); // { request_id, status, polling_url }
}

// ─── Async: Tracks Song ────────────────────────────────────────────
export async function startTracksSong(apiKey, params) {
  const res = await fetch(`${BASE_URL}/tracks/v1/generate`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      prompt: params.prompt,
      lyrics: params.lyrics ?? '',
      duration: params.duration ?? 30,
      bpm: params.bpm ?? 'auto',
      key: params.key ?? 'auto',
      time_signature: params.time_signature ?? 'auto',
      batch_size: params.batch_size ?? 1,
      thinking: params.thinking ?? false,
      seed: params.seed ?? -1,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tracks API error (${res.status}): ${text}`);
  }
  return res.json(); // { request_id, status, polling_url }
}

// ─── Polling (shared) ──────────────────────────────────────────────
export async function pollStatus(apiKey, pollingUrl) {
  const res = await fetch(pollingUrl, {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Poll error (${res.status}): ${text}`);
  }
  return res.json();
}
