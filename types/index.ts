export interface BlobData {
  x: number;
  y: number;
  width: number;
  height: number;
  cx?: number;
  cy?: number;
  area?: number;
  score: number;
}

export interface AppState {
  // Source
  source: 'video' | 'camera' | null;
  playing: boolean;
  speed: number;
  frameSkip: number;
  frameCount: number;

  // Blob detection
  threshold: number;
  minBlobArea: number;
  sameSize: boolean;
  maxBlobs: number;

  // Shape / Region
  shape: 'square' | 'circle' | 'rounded';
  region: 'box' | 'fill' | 'outline';

  // Effect
  effect: string;
  filters: Set<string>;

  // Connection
  connMode: 'off' | 'mesh' | 'hub';
  connDash: boolean;
  connRate: number;
  connWidth: number;

  // Color / Text
  color: string;
  separateColors: boolean;
  crazy: boolean;
  labelText: string;
  textPosition: 'center' | 'top' | 'bottom';
  fontSize: number;

  // Export
  hqExport: boolean;
  recorder: MediaRecorder | null;
  recording: boolean;

  // Audio
  audioMode: 'none' | 'beep' | 'bird';
  singleTracking: boolean;

  // Text
  showText: boolean;

  // Internal tracking
  blobs: BlobData[];
  smoothBlobs: BlobData[];
  particlePhase: number;
}

export interface UIState {
  speed: number;
  maxBlobs: number;
  shape: string;
  effect: string;
  filters: Set<string>;
  connMode: string;
  connDash: boolean;
  connWidth: number;
  audioMode: string;
  fontSize: number;
  singleTracking: boolean;
  sameSize: boolean;
  separateColors: boolean;
  crazy: boolean;
  showText: boolean;
  color: string;
  labelText: string;
  textPosition: string;
  region: string;
  frameSkip: number;
  minBlobArea: number;
  connRate: number;
  theme: 'dark' | 'light';
  playing: boolean;
  hqExport: boolean;
  recording: boolean;
}

export interface Controls {
  setSpeed: (s: number) => void;
  setMaxBlobs: (v: number) => void;
  setShape: (s: 'square' | 'circle' | 'rounded') => void;
  setEffect: (e: string) => void;
  toggleFilter: (f: string) => void;
  setConn: (mode: 'off' | 'mesh' | 'hub') => void;
  setConnDash: (dash: boolean) => void;
  setConnWidth: (w: number) => void;
  setConnRate: (r: number) => void;
  setFont: (s: number) => void;
  setAudio: (mode: 'none' | 'beep' | 'bird') => void;
  setColor: (c: string) => void;
  setSeparateColors: (v: boolean) => void;
  setCrazy: (v: boolean) => void;
  setShowText: (v: boolean) => void;
  setLabelText: (t: string) => void;
  setTextPosition: (p: 'center' | 'top' | 'bottom') => void;
  setRegion: (r: 'box' | 'fill' | 'outline') => void;
  setFrameSkip: (v: number) => void;
  setMinBlobArea: (v: number) => void;
  setSingleTracking: (v: boolean) => void;
  setSameSize: (v: boolean) => void;
  setHqExport: (v: boolean) => void;
  uploadVideo: () => void;
  openCamera: () => void;
  exportVideo: (format: 'mp4' | 'webm') => void;
}
