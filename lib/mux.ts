const MUX_API = "https://api.mux.com/video/v1";

export function hasMuxConfig() {
  return Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);
}

export async function muxRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) throw new Error("mux_not_configured");

  const response = await fetch(`${MUX_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    console.error("Mux API request failed", { path, status: response.status });
    throw new Error("mux_request_failed");
  }

  return response.json() as Promise<T>;
}

export type MuxUpload = {
  id: string;
  url?: string;
  status: "waiting" | "asset_created" | "errored" | "cancelled" | "timed_out";
  asset_id?: string;
  error?: { type?: string; message?: string };
};

export type MuxAsset = {
  id: string;
  status: "preparing" | "ready" | "errored";
  playback_ids?: Array<{ id: string; policy: "public" | "signed" }>;
  errors?: { messages?: string[] };
};
