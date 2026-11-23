export const VIDEO_ID = "jexiqM5zWgo";
export const VIDEO_URL = "https://youtu.be/jexiqM5zWgo";

declare global {
  interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void; }
}

export function loadYT(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    if (!document.getElementById("yt-api")) {
      const s = document.createElement("script");
      s.id = "yt-api"; s.src = "https://www.youtube.com/iframe_api"; s.async = true;
      s.onerror = () => reject(new Error("load"));
      document.head.appendChild(s);
    }
    setTimeout(() => reject(new Error("timeout")), 12000);
  });
}
