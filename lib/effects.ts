import type { AppState, BlobData } from '@/types';

export const PALETTE = [
  '#00ff88', '#ff4488', '#44aaff', '#ffaa00', '#aa44ff',
  '#00ffff', '#ff6644', '#88ff44', '#ff44ff', '#44ffaa',
  '#ffff44', '#4488ff', '#ff8844', '#44ff88', '#ff4444',
  '#8844ff',
];

export function shapePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: string
): void {
  if (shape === 'circle') {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (shape === 'rounded') {
    const r = 12;
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
  }
}

export function getBlobColor(index: number, state: AppState): string {
  if (state.crazy) {
    const hue = (Date.now() * 0.5 + index * 60) % 360;
    return `hsl(${hue}, 100%, 60%)`;
  }
  if (state.separateColors) {
    return PALETTE[index % PALETTE.length];
  }
  return state.color;
}

export function drawBlobEffect(
  ctx: CanvasRenderingContext2D,
  blob: BlobData,
  index: number,
  color: string,
  state: AppState
): void {
  const { x, y, width: bw, height: bh } = blob;
  const cx = x + bw / 2,
    cy = y + bh / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  switch (state.effect) {
    case 'basic':
      shapePath(ctx, x, y, bw, bh, state.shape);
      ctx.stroke();
      break;

    case 'label':
      shapePath(ctx, x, y, bw, bh, state.shape);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 16, bw, 16);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('OBJ-' + (index + 1), x + 3, y - 4);
      break;

    case 'frame': {
      const corner = Math.min(bw, bh) * 0.3;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + corner);
      ctx.lineTo(x, y);
      ctx.lineTo(x + corner, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + bw - corner, y);
      ctx.lineTo(x + bw, y);
      ctx.lineTo(x + bw, y + corner);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + bh - corner);
      ctx.lineTo(x, y + bh);
      ctx.lineTo(x + corner, y + bh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + bw - corner, y + bh);
      ctx.lineTo(x + bw, y + bh);
      ctx.lineTo(x + bw, y + bh - corner);
      ctx.stroke();
      break;
    }

    case 'lframe': {
      const cl = Math.min(bw, bh) * 0.25;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + cl);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cl, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + bw, y + cl);
      ctx.lineTo(x + bw, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + bw, y);
      ctx.lineTo(x + bw - cl, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + bh - cl);
      ctx.lineTo(x, y + bh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + bh);
      ctx.lineTo(x + cl, y + bh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + bw, y + bh - cl);
      ctx.lineTo(x + bw, y + bh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + bw, y + bh);
      ctx.lineTo(x + bw - cl, y + bh);
      ctx.stroke();
      break;
    }

    case 'xframe':
      shapePath(ctx, x, y, bw, bh, state.shape);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + bw, y + bh);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + bw, y);
      ctx.lineTo(x, y + bh);
      ctx.stroke();
      break;

    case 'grid': {
      shapePath(ctx, x, y, bw, bh, state.shape);
      ctx.stroke();
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.4;
      const gs = Math.max(8, Math.min(bw, bh) / 4);
      for (let gx = x + gs; gx < x + bw; gx += gs) {
        ctx.beginPath();
        ctx.moveTo(gx, y);
        ctx.lineTo(gx, y + bh);
        ctx.stroke();
      }
      for (let gy = y + gs; gy < y + bh; gy += gs) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x + bw, gy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }

    case 'particle': {
      const numP = 8;
      const radius = Math.max(bw, bh) * 0.6;
      for (let i = 0; i < numP; i++) {
        const angle = state.particlePhase + (Math.PI * 2 * i) / numP;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'dash':
      ctx.setLineDash([6, 4]);
      shapePath(ctx, x, y, bw, bh, state.shape);
      ctx.stroke();
      ctx.setLineDash([]);
      break;

    case 'scope': {
      const r = Math.max(bw, bh) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.2, cy);
      ctx.lineTo(cx + r * 1.2, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 1.2);
      ctx.lineTo(cx, cy + r * 1.2);
      ctx.stroke();
      for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.7 * i, cy - 4);
        ctx.lineTo(cx + r * 0.7 * i, cy + 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + r * 0.7 * i);
        ctx.lineTo(cx + 4, cy + r * 0.7 * i);
        ctx.stroke();
      }
      break;
    }

    case 'glow': {
      const gradient = ctx.createRadialGradient(
        cx, cy, 0, cx, cy, Math.max(bw, bh) * 0.8
      );
      gradient.addColorStop(0, color + '66');
      gradient.addColorStop(0.5, color + '33');
      gradient.addColorStop(1, color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(cx, cy, bw * 0.8, bh * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      shapePath(ctx, x, y, bw, bh, state.shape);
      ctx.stroke();
      break;
    }

    case 'backdrop':
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = color;
      shapePath(ctx, x, y, bw, bh, state.shape);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      shapePath(ctx, x, y, bw, bh, state.shape);
      ctx.stroke();
      break;

    case 'win2k': {
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(x, y, bw, bh);
      const barH = 18;
      const grad = ctx.createLinearGradient(x, y, x + bw, y);
      grad.addColorStop(0, '#000080');
      grad.addColorStop(1, '#1084d0');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, bw, barH);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        state.labelText.trim() || 'OBJ-' + (index + 1),
        x + 4,
        y + 13
      );
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(x + bw - 16, y + 2, 14, 14);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + bw - 16, y + 2, 14, 14);
      ctx.beginPath();
      ctx.moveTo(x + bw - 13, y + 5);
      ctx.lineTo(x + bw - 5, y + 13);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + bw - 5, y + 5);
      ctx.lineTo(x + bw - 13, y + 13);
      ctx.stroke();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + bh);
      ctx.lineTo(x, y);
      ctx.lineTo(x + bw, y);
      ctx.stroke();
      ctx.strokeStyle = '#808080';
      ctx.beginPath();
      ctx.moveTo(x + bw, y);
      ctx.lineTo(x + bw, y + bh);
      ctx.lineTo(x, y + bh);
      ctx.stroke();
      ctx.textAlign = 'center';
      break;
    }

    case 'label2':
      shapePath(ctx, x, y, bw, bh, state.shape);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = `bold ${state.fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(
        state.labelText.trim() || 'OBJ-' + (index + 1),
        cx,
        y + bh + state.fontSize + 4
      );
      break;

    default:
      shapePath(ctx, x, y, bw, bh, state.shape);
      ctx.stroke();
      break;
  }

  ctx.restore();
}

export function applyFilters(
  ctx: CanvasRenderingContext2D,
  filterCanvas: HTMLCanvasElement,
  filterCtx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: AppState
): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const len = data.length;

  for (const filter of Array.from(state.filters)) {
    switch (filter) {
      case 'invert':
        for (let i = 0; i < len; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
        break;

      case 'thermal':
        for (let i = 0; i < len; i += 4) {
          const v =
            data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          if (v < 85) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = v * 3;
          } else if (v < 170) {
            data[i] = (v - 85) * 3;
            data[i + 1] = 0;
            data[i + 2] = 255 - (v - 85) * 3;
          } else {
            data[i] = 255;
            data[i + 1] = (v - 170) * 3;
            data[i + 2] = 0;
          }
        }
        break;

      case 'pixel': {
        const ps = 8;
        for (let py = 0; py < h; py += ps) {
          for (let px = 0; px < w; px += ps) {
            const idx = (py * w + px) * 4;
            const r = data[idx],
              g = data[idx + 1],
              b = data[idx + 2];
            for (let dy = 0; dy < ps && py + dy < h; dy++) {
              for (let dx = 0; dx < ps && px + dx < w; dx++) {
                const i = ((py + dy) * w + (px + dx)) * 4;
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
              }
            }
          }
        }
        break;
      }

      case 'tone':
        for (let i = 0; i < len; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;

      case 'dither': {
        const bayer = [
          [0, 8, 2, 10],
          [12, 4, 14, 6],
          [3, 11, 1, 9],
          [15, 7, 13, 5],
        ];
        for (let py = 0; py < h; py++) {
          for (let px = 0; px < w; px++) {
            const i = (py * w + px) * 4;
            const threshold = (bayer[py % 4][px % 4] / 16) * 255;
            for (let c = 0; c < 3; c++) {
              data[i + c] = data[i + c] > threshold ? 255 : 0;
            }
          }
        }
        break;
      }

      case 'edge': {
        const copy = new Uint8ClampedArray(data);
        for (let py = 1; py < h - 1; py++) {
          for (let px = 1; px < w - 1; px++) {
            const i = (py * w + px) * 4;
            for (let c = 0; c < 3; c++) {
              const tl = copy[((py - 1) * w + (px - 1)) * 4 + c];
              const t = copy[((py - 1) * w + px) * 4 + c];
              const tr = copy[((py - 1) * w + (px + 1)) * 4 + c];
              const l = copy[(py * w + (px - 1)) * 4 + c];
              const r = copy[(py * w + (px + 1)) * 4 + c];
              const bl = copy[((py + 1) * w + (px - 1)) * 4 + c];
              const b2 = copy[((py + 1) * w + px) * 4 + c];
              const br = copy[((py + 1) * w + (px + 1)) * 4 + c];
              const gx = -tl - 2 * l - bl + tr + 2 * r + br;
              const gy = -tl - 2 * t - tr + bl + 2 * b2 + br;
              data[i + c] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
            }
          }
        }
        break;
      }

      case 'xray':
        for (let i = 0; i < len; i += 4) {
          const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const inv = 255 - v;
          const c =
            inv < 128
              ? (inv * inv) / 128
              : 255 - ((255 - inv) * (255 - inv)) / 128;
          data[i] = c;
          data[i + 1] = c;
          data[i + 2] = c + 30;
        }
        break;

      case 'fusion':
        for (let i = 0; i < len; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          data[i] = Math.min(255, r * 1.2 + g * 0.1);
          data[i + 1] = Math.min(255, g * 0.8 + b * 0.3);
          data[i + 2] = Math.min(255, b * 1.3 + r * 0.1);
        }
        break;

      case 'mask':
        if (state.smoothBlobs.length > 0) {
          for (let py = 0; py < h; py++) {
            for (let px = 0; px < w; px++) {
              let inBlob = false;
              for (const b of state.smoothBlobs) {
                if (
                  px >= b.x &&
                  px <= b.x + b.width &&
                  py >= b.y &&
                  py <= b.y + b.height
                ) {
                  inBlob = true;
                  break;
                }
              }
              if (!inBlob) {
                const i = (py * w + px) * 4;
                data[i] *= 0.2;
                data[i + 1] *= 0.2;
                data[i + 2] *= 0.2;
              }
            }
          }
        }
        break;

      case 'blink':
        if (Math.sin(Date.now() * 0.01) > 0.5) {
          for (let i = 0; i < len; i += 4) {
            data[i] = Math.min(255, data[i] + 80);
            data[i + 1] = Math.min(255, data[i + 1] + 80);
            data[i + 2] = Math.min(255, data[i + 2] + 80);
          }
        }
        break;

      case 'inv':
        for (let i = 0; i < len; i += 4) {
          data[i] = 255 - data[i];
          data[i + 2] = 255 - data[i + 2];
        }
        break;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Canvas-API based filters (applied after putImageData)
  for (const filter of Array.from(state.filters)) {
    switch (filter) {
      case 'blur':
        filterCtx.clearRect(0, 0, w, h);
        filterCtx.filter = 'blur(3px)';
        filterCtx.drawImage(ctx.canvas, 0, 0);
        filterCtx.filter = 'none';
        ctx.drawImage(filterCanvas, 0, 0);
        break;

      case 'glitch': {
        const numSlices = 10 + Math.random() * 10;
        for (let i = 0; i < numSlices; i++) {
          const sliceY = Math.random() * h;
          const sliceH = 2 + Math.random() * 15;
          const offset = (Math.random() - 0.5) * 30;
          ctx.drawImage(ctx.canvas, 0, sliceY, w, sliceH, offset, sliceY, w, sliceH);
        }
        break;
      }

      case 'zoom': {
        const zf = 1 + 0.03 * Math.sin(Date.now() * 0.005);
        filterCtx.clearRect(0, 0, w, h);
        filterCtx.drawImage(ctx.canvas, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const dx = (w * (1 - zf)) / 2,
          dy = (h * (1 - zf)) / 2;
        ctx.drawImage(filterCanvas, dx, dy, w * zf, h * zf);
        break;
      }

      case 'water': {
        const t = Date.now() * 0.003;
        filterCtx.clearRect(0, 0, w, h);
        filterCtx.drawImage(ctx.canvas, 0, 0);
        const stripH = 4;
        for (let sy = 0; sy < h; sy += stripH) {
          const dx2 = Math.sin(sy * 0.02 + t) * 6;
          ctx.drawImage(filterCanvas, 0, sy, w, stripH, dx2, sy, w, stripH);
        }
        break;
      }

      case 'crt': {
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        for (let sy = 0; sy < h; sy += 3) {
          ctx.fillRect(0, sy, w, 1);
        }
        const vg = ctx.createRadialGradient(
          w / 2, h / 2, w * 0.3,
          w / 2, h / 2, w * 0.8
        );
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);
        break;
      }
    }
  }
}

export function drawConnections(
  ctx: CanvasRenderingContext2D,
  blobs: BlobData[],
  state: AppState
): void {
  ctx.save();
  ctx.strokeStyle = state.color;
  ctx.lineWidth = state.connWidth;
  if (state.connDash) ctx.setLineDash([5, 5]);

  if (state.connMode === 'mesh') {
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        if (Math.random() > state.connRate) continue;
        const a = blobs[i],
          b = blobs[j];
        const ax = a.x + a.width / 2,
          ay = a.y + a.height / 2;
        const bx = b.x + b.width / 2,
          by = b.y + b.height / 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }
  } else if (state.connMode === 'hub') {
    const hub = blobs[0];
    const hx = hub.x + hub.width / 2,
      hy = hub.y + hub.height / 2;
    for (let i = 1; i < blobs.length; i++) {
      if (Math.random() > state.connRate) continue;
      const b = blobs[i];
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(b.x + b.width / 2, b.y + b.height / 2);
      ctx.stroke();
    }
  }

  ctx.setLineDash([]);
  ctx.restore();
}

export function drawBlobText(
  ctx: CanvasRenderingContext2D,
  blobs: BlobData[],
  state: AppState
): void {
  ctx.save();
  ctx.font = `bold ${state.fontSize}px monospace`;
  ctx.fillStyle = state.color;
  ctx.textAlign = 'center';

  blobs.forEach((b, i) => {
    const text = state.labelText.trim();
    if (!text) return;

    const blobCx = b.x + b.width / 2;
    let ty: number;
    switch (state.textPosition) {
      case 'top':
        ty = b.y - 6;
        break;
      case 'bottom':
        ty = b.y + b.height + state.fontSize + 2;
        break;
      default:
        ty = b.y + b.height / 2 + state.fontSize / 3;
        break;
    }

    if (state.separateColors) ctx.fillStyle = PALETTE[i % PALETTE.length];
    if (state.crazy) {
      const hue = (Date.now() * 0.5 + i * 60) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
    }
    ctx.fillText(text, blobCx, ty);
  });

  ctx.restore();
}
