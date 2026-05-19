'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { AppState, UIState, Controls } from '@/types';
import { DW, DH, detectBlobs, smoothBlobsFn } from '@/lib/tracking';
import {
  applyFilters,
  drawBlobEffect,
  drawConnections,
  drawBlobText,
  getBlobColor,
} from '@/lib/effects';
import { triggerAudio } from '@/lib/audio';

const defaultAppState: AppState = {
  source: null,
  playing: false,
  speed: 1,
  frameSkip: 0,
  frameCount: 0,
  threshold: 128,
  minBlobArea: 1200,
  sameSize: false,
  maxBlobs: 8,
  shape: 'square',
  region: 'box',
  effect: 'basic',
  filters: new Set(),
  connMode: 'off',
  connDash: false,
  connRate: 0.5,
  connWidth: 1,
  color: '#00ff88',
  separateColors: false,
  crazy: false,
  labelText: '',
  textPosition: 'center',
  fontSize: 12,
  hqExport: true,
  recorder: null,
  recording: false,
  audioMode: 'none',
  singleTracking: false,
  showText: false,
  blobs: [],
  smoothBlobs: [],
  particlePhase: 0,
};

const defaultUIState: UIState = {
  speed: 1,
  maxBlobs: 8,
  shape: 'square',
  effect: 'basic',
  filters: new Set(),
  connMode: 'off',
  connDash: false,
  connWidth: 1,
  audioMode: 'none',
  fontSize: 12,
  singleTracking: false,
  sameSize: false,
  separateColors: false,
  crazy: false,
  showText: false,
  color: '#00ff88',
  labelText: '',
  textPosition: 'center',
  region: 'box',
  frameSkip: 0,
  minBlobArea: 1200,
  connRate: 0.5,
  theme: 'dark',
  playing: false,
  hqExport: true,
  recording: false,
};

export function useTracker() {
  const stateRef = useRef<AppState>({ ...defaultAppState, filters: new Set() });
  const [uiState, setUiState] = useState<UIState>({
    ...defaultUIState,
    filters: new Set(),
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement>(null);
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);
  const renderingRef = useRef(false);

  // Init offscreen canvas
  useEffect(() => {
    if (offscreenRef.current) {
      offscreenRef.current.width = DW;
      offscreenRef.current.height = DH;
    }
  }, []);

  const startRendering = useCallback(() => {
    stateRef.current.playing = true;
    setUiState((u) => ({ ...u, playing: true }));
    if (!renderingRef.current) {
      renderingRef.current = true;
      requestAnimationFrame(renderLoop);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderLoop() {
    const s = stateRef.current;
    if (!s.playing) {
      renderingRef.current = false;
      return;
    }
    rafRef.current = requestAnimationFrame(renderLoop);

    s.frameCount++;
    if (s.frameSkip > 0 && s.frameCount % (s.frameSkip + 1) !== 0) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const offscreen = offscreenRef.current;
    const filterCanvas = filterCanvasRef.current;
    if (!canvas || !video || !offscreen || !filterCanvas) return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
      filterCanvas.width = vw;
      filterCanvas.height = vh;
    }
    const w = canvas.width,
      h = canvas.height;

    const ctx = canvas.getContext('2d');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    const filterCtx = filterCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || !offCtx || !filterCtx) return;

    ctx.drawImage(video, 0, 0, w, h);

    offCtx.drawImage(video, 0, 0, DW, DH);
    const imgData = offCtx.getImageData(0, 0, DW, DH);
    const rawBlobs = detectBlobs(imgData, DW, DH, s, w, h);

    const scaleX = w / DW,
      scaleY = h / DH;
    let scaledBlobs = rawBlobs.map((b) => ({
      x: b.x * scaleX,
      y: b.y * scaleY,
      width: b.width * scaleX,
      height: b.height * scaleY,
      score: b.score,
    }));

    if (s.sameSize && scaledBlobs.length > 0) {
      const avgW = scaledBlobs.reduce((acc, b) => acc + b.width, 0) / scaledBlobs.length;
      const avgH = scaledBlobs.reduce((acc, b) => acc + b.height, 0) / scaledBlobs.length;
      scaledBlobs.forEach((b) => {
        b.width = avgW;
        b.height = avgH;
      });
    }

    if (s.singleTracking && scaledBlobs.length > 1) {
      scaledBlobs.sort((a, b) => b.width * b.height - a.width * a.height);
      scaledBlobs = [scaledBlobs[0]];
    }

    s.smoothBlobs = smoothBlobsFn(scaledBlobs, s.smoothBlobs);

    if (s.filters.size > 0) {
      applyFilters(ctx, filterCanvas, filterCtx, w, h, s);
    }

    s.smoothBlobs.forEach((blob, i) => {
      const color = getBlobColor(i, s);
      drawBlobEffect(ctx, blob, i, color, s);
    });

    if (s.connMode !== 'off' && s.smoothBlobs.length > 1) {
      drawConnections(ctx, s.smoothBlobs, s);
    }

    if (s.showText && s.labelText.trim()) {
      drawBlobText(ctx, s.smoothBlobs, s);
    }

    if (s.smoothBlobs.length > 0) {
      triggerAudio(s.audioMode);
    }

    s.particlePhase += 0.05;
  }

  // ── Controls ─────────────────────────────────────────────────────────

  const setSpeed = useCallback((s: number) => {
    stateRef.current.speed = s;
    if (videoRef.current) videoRef.current.playbackRate = s;
    setUiState((u) => ({ ...u, speed: s }));
  }, []);

  const setMaxBlobs = useCallback((v: number) => {
    stateRef.current.maxBlobs = v;
    setUiState((u) => ({ ...u, maxBlobs: v }));
  }, []);

  const setShape = useCallback((s: 'square' | 'circle' | 'rounded') => {
    stateRef.current.shape = s;
    setUiState((u) => ({ ...u, shape: s }));
  }, []);

  const setEffect = useCallback((e: string) => {
    stateRef.current.effect = e;
    setUiState((u) => ({ ...u, effect: e }));
  }, []);

  const toggleFilter = useCallback((f: string) => {
    const filters = new Set(stateRef.current.filters);
    if (filters.has(f)) filters.delete(f);
    else filters.add(f);
    stateRef.current.filters = filters;
    setUiState((u) => ({ ...u, filters: new Set(filters) }));
  }, []);

  const setConn = useCallback((mode: 'off' | 'mesh' | 'hub') => {
    stateRef.current.connMode = mode;
    setUiState((u) => ({ ...u, connMode: mode }));
  }, []);

  const setConnDash = useCallback((dash: boolean) => {
    stateRef.current.connDash = dash;
    setUiState((u) => ({ ...u, connDash: dash }));
  }, []);

  const setConnWidth = useCallback((w: number) => {
    stateRef.current.connWidth = w;
    setUiState((u) => ({ ...u, connWidth: w }));
  }, []);

  const setConnRate = useCallback((r: number) => {
    stateRef.current.connRate = r;
    setUiState((u) => ({ ...u, connRate: r }));
  }, []);

  const setFont = useCallback((s: number) => {
    stateRef.current.fontSize = s;
    setUiState((u) => ({ ...u, fontSize: s }));
  }, []);

  const setAudio = useCallback((mode: 'none' | 'beep' | 'bird') => {
    stateRef.current.audioMode = mode;
    setUiState((u) => ({ ...u, audioMode: mode }));
  }, []);

  const setColor = useCallback((c: string) => {
    stateRef.current.color = c;
    setUiState((u) => ({ ...u, color: c }));
  }, []);

  const setSeparateColors = useCallback((v: boolean) => {
    stateRef.current.separateColors = v;
    setUiState((u) => ({ ...u, separateColors: v }));
  }, []);

  const setCrazy = useCallback((v: boolean) => {
    stateRef.current.crazy = v;
    setUiState((u) => ({ ...u, crazy: v }));
  }, []);

  const setShowText = useCallback((v: boolean) => {
    stateRef.current.showText = v;
    setUiState((u) => ({ ...u, showText: v }));
  }, []);

  const setLabelText = useCallback((t: string) => {
    stateRef.current.labelText = t;
    setUiState((u) => ({ ...u, labelText: t }));
  }, []);

  const setTextPosition = useCallback((p: 'center' | 'top' | 'bottom') => {
    stateRef.current.textPosition = p;
    setUiState((u) => ({ ...u, textPosition: p }));
  }, []);

  const setRegion = useCallback((r: 'box' | 'fill' | 'outline') => {
    stateRef.current.region = r;
    setUiState((u) => ({ ...u, region: r }));
  }, []);

  const setFrameSkip = useCallback((v: number) => {
    stateRef.current.frameSkip = v;
    setUiState((u) => ({ ...u, frameSkip: v }));
  }, []);

  const setMinBlobArea = useCallback((v: number) => {
    stateRef.current.minBlobArea = v;
    setUiState((u) => ({ ...u, minBlobArea: v }));
  }, []);

  const setSingleTracking = useCallback((v: boolean) => {
    stateRef.current.singleTracking = v;
    setUiState((u) => ({ ...u, singleTracking: v }));
  }, []);

  const setSameSize = useCallback((v: boolean) => {
    stateRef.current.sameSize = v;
    setUiState((u) => ({ ...u, sameSize: v }));
  }, []);

  const setHqExport = useCallback((v: boolean) => {
    stateRef.current.hqExport = v;
    setUiState((u) => ({ ...u, hqExport: v }));
  }, []);

  const uploadVideo = useCallback(() => {
    videoInputRef.current?.click();
  }, []);

  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.play();
      stateRef.current.source = 'camera';
      startRendering();
    } catch (err: any) {
      alert('Camera access denied: ' + err.message);
    }
  }, [startRendering]);

  const handleVideoFileChange = useCallback(
    (e: Event) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = null;
      video.src = url;
      video.loop = true;
      video.muted = true;
      video.playbackRate = stateRef.current.speed;
      video.play();
      stateRef.current.source = 'video';
      startRendering();
    },
    [startRendering]
  );

  useEffect(() => {
    const input = videoInputRef.current;
    if (!input) return;
    input.addEventListener('change', handleVideoFileChange);
    return () => input.removeEventListener('change', handleVideoFileChange);
  }, [handleVideoFileChange]);

  const exportVideo = useCallback((format: 'mp4' | 'webm') => {
    const s = stateRef.current;
    if (s.recording) {
      s.recorder?.stop();
      s.recording = false;
      setUiState((u) => ({ ...u, recording: false }));
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType =
      format === 'mp4'
        ? MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
          ? 'video/mp4;codecs=avc1'
          : 'video/webm;codecs=vp9'
        : 'video/webm;codecs=vp9';

    const bitrate = s.hqExport ? 8000000 : 2500000;
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm',
      videoBitsPerSecond: bitrate,
    });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trackr-export.${
        format === 'mp4' && recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'
      }`;
      a.click();
      URL.revokeObjectURL(url);
      setUiState((u) => ({ ...u, recording: false }));
    };

    recorder.start();
    s.recorder = recorder;
    s.recording = true;
    setUiState((u) => ({ ...u, recording: true }));

    const video = videoRef.current;
    if (
      s.source === 'video' &&
      video?.duration &&
      isFinite(video.duration)
    ) {
      setTimeout(() => {
        if (s.recording) {
          recorder.stop();
          s.recording = false;
        }
      }, (video.duration * 1000) / s.speed);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setUiState((u) => ({ ...u, theme: u.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const controls: Controls = {
    setSpeed,
    setMaxBlobs,
    setShape,
    setEffect,
    toggleFilter,
    setConn,
    setConnDash,
    setConnWidth,
    setConnRate,
    setFont,
    setAudio,
    setColor,
    setSeparateColors,
    setCrazy,
    setShowText,
    setLabelText,
    setTextPosition,
    setRegion,
    setFrameSkip,
    setMinBlobArea,
    setSingleTracking,
    setSameSize,
    setHqExport,
    uploadVideo,
    openCamera,
    exportVideo,
  };

  return {
    canvasRef,
    videoRef,
    offscreenRef,
    filterCanvasRef,
    videoInputRef,
    uiState,
    controls,
    toggleTheme,
  };
}
