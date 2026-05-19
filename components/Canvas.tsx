'use client';

import React from 'react';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  offscreenRef: React.RefObject<HTMLCanvasElement>;
  filterCanvasRef: React.RefObject<HTMLCanvasElement>;
  videoInputRef: React.RefObject<HTMLInputElement>;
  uploadVideo: () => void;
  openCamera: () => void;
  playing: boolean;
}

export default function Canvas({
  canvasRef,
  videoRef,
  offscreenRef,
  filterCanvasRef,
  videoInputRef,
  uploadVideo,
  openCamera,
  playing,
}: CanvasProps) {
  return (
    <main id="main">
      {/* Decorative background */}
      {!playing && (
        <>
          <div className="placeholder-grid" />
          <div className="scan-line" />
        </>
      )}

      {/* Placeholder */}
      {!playing && (
        <div id="placeholder">
          <div className="placeholder-logo">TRACKR</div>
          <p className="placeholder-sub">
            Upload a video or open camera to start real-time tracking
          </p>
          <div className="placeholder-actions">
            <button className="placeholder-btn primary" onClick={uploadVideo}>
              ↑ Upload Video
            </button>
            <button className="placeholder-btn secondary" onClick={openCamera}>
              ⊙ Open Camera
            </button>
          </div>
        </div>
      )}

      {/* Display canvas */}
      <canvas
        ref={canvasRef}
        id="display-canvas"
        style={{ display: playing ? 'block' : 'none' }}
      />

      {/* Hidden elements */}
      <video ref={videoRef} id="video" muted style={{ display: 'none' }} />
      <canvas ref={offscreenRef} id="offscreen" style={{ display: 'none' }} />
      <canvas ref={filterCanvasRef} id="filterCanvas" style={{ display: 'none' }} />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
      />
    </main>
  );
}
