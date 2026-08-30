"use client";

import MuxPlayer from "@mux/mux-player-react";

export function MuxVideo({ playbackId, title, poster, autoPlay = false, muted = false, loop = false, preview = false, fit = "contain", className = "" }: {
  playbackId: string;
  title: string;
  poster?: string | null;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preview?: boolean;
  fit?: "contain" | "cover";
  className?: string;
}) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      metadataVideoTitle={title}
      accentColor="#00a3e0"
      primaryColor="#ffffff"
      secondaryColor="#003b70"
      poster={poster ?? undefined}
      autoPlay={autoPlay ? "muted" : false}
      muted={muted}
      loop={loop}
      playsInline
      preload={preview ? "auto" : "metadata"}
      assetStartTime={preview ? 0 : undefined}
      assetEndTime={preview ? 35 : undefined}
      maxResolution={preview ? "720p" : undefined}
      capRenditionToPlayerSize={preview}
      nohotkeys={preview}
      disablePictureInPicture={preview}
      className={`h-full w-full ${className}`}
      style={{ "--media-object-fit": fit, ...(preview ? { "--controls": "none" } : {}) }}
    />
  );
}
