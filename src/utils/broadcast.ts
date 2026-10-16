export function nextQueueIndex(index: number, step: number, length: number): number {
  if (length < 1) return 0;
  return ((index + step) % length + length) % length;
}

export function normalizeBroadcastUrl(input: string): {
  streamUrl: string;
  streamType: 'youtube' | 'hls' | 'mp4';
} {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error('Enter a valid YouTube, HLS, or MP4 URL.');
  }
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error('Use an HTTPS or HTTP video URL.');
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  if (['youtube.com', 'youtube-nocookie.com', 'youtu.be'].includes(host)) {
    const parts = url.pathname.split('/').filter(Boolean);
    const id = host === 'youtu.be'
      ? parts[0]
      : parts[0] === 'watch'
        ? url.searchParams.get('v')
        : ['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : null;
    if (!id || !/^[\w-]{11}$/.test(id)) {
      throw new Error('Paste a YouTube video link (watch, share, Shorts, live, or embed).');
    }
    return {
      streamUrl: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1`,
      streamType: 'youtube',
    };
  }
  if (/\.m3u8$/i.test(url.pathname)) return { streamUrl: url.href, streamType: 'hls' };
  if (/\.mp4$/i.test(url.pathname)) return { streamUrl: url.href, streamType: 'mp4' };
  throw new Error('Use a YouTube video link, an HLS (.m3u8) feed, or a direct MP4 URL.');
}
