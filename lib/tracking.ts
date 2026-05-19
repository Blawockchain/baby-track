import type { AppState, BlobData } from '@/types';

export const DW = 160;
export const DH = 120;

export function boxBlur(bright: Uint8Array, w: number, h: number): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += bright[(y + dy) * w + (x + dx)];
        }
      }
      out[y * w + x] = sum >= 5 ? 1 : 0;
    }
  }
  return out;
}

export function detectBlobs(
  imgData: ImageData,
  w: number,
  h: number,
  state: AppState,
  displayW: number,
  displayH: number
): BlobData[] {
  const data = imgData.data;
  const blobs: BlobData[] = [];

  let bright: Uint8Array = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    bright[i] =
      data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114 >
      state.threshold
        ? 1
        : 0;
  }

  bright = boxBlur(bright, w, h) as Uint8Array;
  bright = boxBlur(bright, w, h) as Uint8Array;

  const scaleX = displayW / DW;
  const scaleY = displayH / DH;
  const minAreaDetect = state.minBlobArea / (scaleX * scaleY);

  const visited = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pos = y * w + x;
      if (bright[pos] && !visited[pos]) {
        const queue: number[] = [pos];
        visited[pos] = 1;
        let minX = x,
          maxX = x,
          minY = y,
          maxY = y;
        let count = 0;

        let qi = 0;
        while (qi < queue.length) {
          const p = queue[qi++];
          const px = p % w,
            py = (p / w) | 0;
          count++;

          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;

          const neighbors = [p - 1, p + 1, p - w, p + w];
          for (const n of neighbors) {
            if (n >= 0 && n < w * h && !visited[n] && bright[n]) {
              visited[n] = 1;
              queue.push(n);
            }
          }
        }

        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        const area = bw * bh;

        if (area >= minAreaDetect && count >= minAreaDetect * 0.3) {
          blobs.push({
            x: minX,
            y: minY,
            width: bw,
            height: bh,
            cx: (minX + maxX) / 2,
            cy: (minY + maxY) / 2,
            area,
            score: Math.min(1, count / area),
          });
        }
      }
    }
  }

  blobs.sort((a, b) => (b.area ?? 0) - (a.area ?? 0));

  const mergeDistDetect = 20 / (displayW / DW);
  const merged: BlobData[] = [];
  const used = new Set<number>();

  for (let i = 0; i < blobs.length; i++) {
    if (used.has(i)) continue;
    let b = { ...blobs[i] };
    for (let j = i + 1; j < blobs.length; j++) {
      if (used.has(j)) continue;
      const dx = (b.cx ?? 0) - (blobs[j].cx ?? 0);
      const dy = (b.cy ?? 0) - (blobs[j].cy ?? 0);
      if (Math.sqrt(dx * dx + dy * dy) < mergeDistDetect) {
        const nx = Math.min(b.x, blobs[j].x);
        const ny = Math.min(b.y, blobs[j].y);
        const nx2 = Math.max(b.x + b.width, blobs[j].x + blobs[j].width);
        const ny2 = Math.max(b.y + b.height, blobs[j].y + blobs[j].height);
        b.x = nx;
        b.y = ny;
        b.width = nx2 - nx;
        b.height = ny2 - ny;
        b.cx = (nx + nx2) / 2;
        b.cy = (ny + ny2) / 2;
        b.area = b.width * b.height;
        b.score = Math.max(b.score, blobs[j].score);
        used.add(j);
      }
    }
    merged.push(b);
  }

  merged.sort((a, b) => (b.area ?? 0) - (a.area ?? 0));
  return merged.slice(0, state.maxBlobs);
}

export function smoothBlobsFn(
  newBlobs: BlobData[],
  prevSmooth: BlobData[]
): BlobData[] {
  const lerp = 0.25;
  const maxDist = 200;

  if (prevSmooth.length === 0) {
    return newBlobs.map((b) => ({ ...b }));
  }

  const matched = new Set<number>();
  const updated: BlobData[] = [];

  for (const nb of newBlobs) {
    let bestIdx = -1,
      bestDist = Infinity;
    const ncx = nb.x + nb.width / 2,
      ncy = nb.y + nb.height / 2;

    prevSmooth.forEach((sb, i) => {
      if (matched.has(i)) return;
      const scx = sb.x + sb.width / 2,
        scy = sb.y + sb.height / 2;
      const d = Math.hypot(ncx - scx, ncy - scy);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });

    if (bestIdx >= 0 && bestDist < maxDist) {
      matched.add(bestIdx);
      const sb = prevSmooth[bestIdx];
      updated.push({
        x: sb.x + (nb.x - sb.x) * lerp,
        y: sb.y + (nb.y - sb.y) * lerp,
        width: sb.width + (nb.width - sb.width) * lerp,
        height: sb.height + (nb.height - sb.height) * lerp,
        score: nb.score,
      });
    } else {
      updated.push({ ...nb });
    }
  }

  return updated;
}
