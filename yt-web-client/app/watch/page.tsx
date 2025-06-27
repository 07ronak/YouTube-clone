"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function WatchContent() {
  const videoPrefix = "https://storage.googleapis.com/processed-videos-ronak/";
  const videoSrc = useSearchParams().get("v");

  return (
    <div>
      <h1>Watch Page</h1>
      <video controls src={videoPrefix + videoSrc} className="w-3/4 h-auto" />
    </div>
  );
}

export default function Watch() {
  return (
    <Suspense fallback={<div>Loading video...</div>}>
      <WatchContent />
    </Suspense>
  );
}
