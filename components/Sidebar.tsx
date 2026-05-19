'use client';

import React from 'react';
import type { UIState, Controls } from '@/types';

interface SidebarProps {
  uiState: UIState;
  controls: Controls;
  toggleTheme: () => void;
}

export default function Sidebar({ uiState, controls, toggleTheme }: SidebarProps) {
  const {
    speed, maxBlobs, shape, effect, filters, connMode, connDash,
    connWidth, audioMode, fontSize, singleTracking, sameSize,
    separateColors, crazy, showText, color, labelText, textPosition,
    region, frameSkip, minBlobArea, connRate, recording, hqExport,
  } = uiState;

  return (
    <div id="sidebar">

      {/* ── HEADER ── */}
      <div className="card">
        <div className="logo-row">
          <div className="logo-block">
            <div className="logo-dot" />
            <span className="logo">TRACKR</span>
          </div>
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            ◑
          </button>
        </div>
        <div className="nav-links">
          <span>MEMBERSHIP</span>
          <span>CONTACT</span>
          <span>TIPS ↗</span>
        </div>
      </div>

      {/* ── NOTIFICATION ── */}
      <div className="card notif-card">
        <div className="notif-badge">⚡</div>
        <span>Try ImageTrack (Image Version)</span>
        <span className="notif-arrow">↗</span>
      </div>

      {/* ── VIDEO ACTIONS ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">▶</span> Video
          </div>
        </div>
        <div className="btn-row-2">
          <button className="btn primary" onClick={controls.uploadVideo}>
            ↑ Upload
          </button>
          <button className="btn primary" onClick={controls.openCamera}>
            ⊙ Camera
          </button>
        </div>
        <div className="btn-row-2">
          <button className="btn" onClick={() => controls.exportVideo('mp4')}>
            {recording ? '■ Stop' : '↓ MP4'}
          </button>
          <button className="btn" onClick={() => controls.exportVideo('webm')}>
            {recording ? '■ Stop' : '↓ WebM'}
          </button>
        </div>
        <div className="btn-full">
          <button
            className={`btn has-dot${hqExport ? ' active' : ''}`}
            onClick={() => {
              controls.setHqExport(!hqExport);
              controls.exportVideo('mp4');
            }}
          >
            ↓ High-Quality Export
          </button>
        </div>
      </div>

      {/* ── SPEED ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">⚡</span> Playback Speed
          </div>
        </div>
        <div className="btn-row-4">
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              className={`btn${speed === s ? ' active' : ''}`}
              onClick={() => controls.setSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* ── PERFORMANCE ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">◎</span> Performance
          </div>
          <div className="section-header-right">
            {frameSkip === 0 ? 'No Skip' : `Skip ${frameSkip}`}
          </div>
        </div>
        <div className="slider-row">
          <input
            type="range"
            min={0}
            max={4}
            value={frameSkip}
            onChange={(e) => controls.setFrameSkip(Number(e.target.value))}
          />
          <span className="slider-val">{frameSkip}</span>
        </div>
      </div>

      {/* ── TRACKING ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">⊛</span> Tracking
          </div>
        </div>
        <div className="slider-row">
          <span className="row-label">Min</span>
          <input
            type="range"
            min={200}
            max={5000}
            value={minBlobArea}
            onChange={(e) => controls.setMinBlobArea(Number(e.target.value))}
          />
          <span className="slider-val">{minBlobArea}</span>
        </div>
        <div className="btn-row-4">
          {[3, 8, 15, 30].map((v) => (
            <button
              key={v}
              className={`btn${maxBlobs === v ? ' active' : ''}`}
              onClick={() => controls.setMaxBlobs(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="btn-row-2">
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={singleTracking}
              onChange={(e) => controls.setSingleTracking(e.target.checked)}
            />
            <span>Single</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={sameSize}
              onChange={(e) => controls.setSameSize(e.target.checked)}
            />
            <span>Same Size</span>
          </label>
        </div>
      </div>

      {/* ── SHAPE ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">◻</span> Shape
          </div>
        </div>
        <div className="btn-row-3">
          {(
            [
              { val: 'square', label: '□ Square' },
              { val: 'circle', label: '○ Circle' },
              { val: 'rounded', label: '▭ Round' },
            ] as const
          ).map(({ val, label }) => (
            <button
              key={val}
              className={`btn${shape === val ? ' active' : ''}${val !== 'circle' ? ' has-dot' : ''}`}
              onClick={() => controls.setShape(val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── REGION STYLE ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">✦</span> Region Style
          </div>
          <div className="section-header-right">
            <select
              value={region}
              onChange={(e) =>
                controls.setRegion(e.target.value as 'box' | 'fill' | 'outline')
              }
            >
              <option value="box">Box</option>
              <option value="fill">Fill</option>
              <option value="outline">Outline</option>
            </select>
          </div>
        </div>
        <div className="sub-label">Basic Effects</div>
        <div className="btn-row-3">
          {['basic', 'label', 'frame'].map((e) => (
            <button
              key={e}
              className={`btn${effect === e ? ' active' : ''}`}
              onClick={() => controls.setEffect(e)}
            >
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>
        <div className="btn-row-3">
          {[
            { val: 'lframe', label: 'L-Frame' },
            { val: 'xframe', label: 'X-Frame' },
            { val: 'grid', label: 'Grid' },
          ].map(({ val, label }) => (
            <button
              key={val}
              className={`btn${effect === val ? ' active' : ''}`}
              onClick={() => controls.setEffect(val)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="btn-row-3">
          {['particle', 'dash', 'scope'].map((e) => (
            <button
              key={e}
              className={`btn${effect === e ? ' active' : ''}`}
              onClick={() => controls.setEffect(e)}
            >
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>
        <div className="btn-row-3">
          {[
            { val: 'win2k', label: 'Win2K' },
            { val: 'glow', label: 'Glow' },
            { val: 'backdrop', label: 'Backdrop' },
          ].map(({ val, label }) => (
            <button
              key={val}
              className={`btn${effect === val ? ' active' : ''}`}
              onClick={() => controls.setEffect(val)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="btn-row-3">
          <button
            className={`btn${effect === 'label2' ? ' active' : ''}`}
            onClick={() => controls.setEffect('label2')}
          >
            Label2
          </button>
        </div>
      </div>

      {/* ── FILTER EFFECTS ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">⚙</span> Filter Effects
          </div>
        </div>
        {[
          ['invert', 'fusion', 'glitch'],
          ['thermal', 'pixel', 'tone'],
          ['blur', 'dither', 'zoom'],
          ['xray', 'water', 'mask'],
          ['crt', 'edge', 'blink'],
          ['inv'],
        ].map((row, ri) => (
          <div className="btn-row-3" key={ri}>
            {row.map((f) => (
              <button
                key={f}
                className={`btn${filters.has(f) ? ' active' : ''}`}
                onClick={() => controls.toggleFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* ── CONNECTIONS ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">⇆</span> Connections
          </div>
        </div>
        <div className="btn-row-3">
          {(['off', 'mesh', 'hub'] as const).map((m) => (
            <button
              key={m}
              className={`btn${connMode === m ? ' active' : ''}`}
              onClick={() => controls.setConn(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        <div className="btn-row" style={{ alignItems: 'center' }}>
          <span className="row-label">Line</span>
          <button
            className={`btn${!connDash ? ' active' : ''}`}
            onClick={() => controls.setConnDash(false)}
          >
            Solid
          </button>
          <button
            className={`btn${connDash ? ' active' : ''}`}
            onClick={() => controls.setConnDash(true)}
          >
            Dash
          </button>
          <span className="row-label" style={{ marginLeft: 4 }}>W</span>
          {[1, 2, 3].map((w) => (
            <button
              key={w}
              className={`btn${connWidth === w ? ' active' : ''}`}
              onClick={() => controls.setConnWidth(w)}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="slider-row">
          <span className="row-label">Rate</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(connRate * 100)}
            onChange={(e) => controls.setConnRate(Number(e.target.value) / 100)}
          />
          <span className="slider-val">{connRate.toFixed(2)}</span>
        </div>
      </div>

      {/* ── COLOR & TEXT ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">◉</span> Color &amp; Text
          </div>
        </div>
        <div className="btn-row" style={{ alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={color}
            onChange={(e) => controls.setColor(e.target.value)}
          />
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={separateColors}
              onChange={(e) => controls.setSeparateColors(e.target.checked)}
            />
            <span>Separate</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={crazy}
              onChange={(e) => controls.setCrazy(e.target.checked)}
            />
            <span>Crazy</span>
          </label>
        </div>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={showText}
            onChange={(e) => controls.setShowText(e.target.checked)}
          />
          <span>Show Text</span>
        </label>
        <input
          type="text"
          className="field"
          placeholder="Label text…"
          value={labelText}
          onChange={(e) => controls.setLabelText(e.target.value)}
        />
        <div className="btn-row-4">
          {[10, 12, 16, 20].map((s) => (
            <button
              key={s}
              className={`btn${fontSize === s ? ' active' : ''}`}
              onClick={() => controls.setFont(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="btn-row" style={{ alignItems: 'center', gap: 6 }}>
          <span className="row-label">Pos</span>
          <select
            value={textPosition}
            onChange={(e) =>
              controls.setTextPosition(
                e.target.value as 'center' | 'top' | 'bottom'
              )
            }
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      </div>

      {/* ── AUDIO ── */}
      <div className="card">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-icon">♪</span> Audio
          </div>
        </div>
        <div className="btn-row-3">
          {(['none', 'beep', 'bird'] as const).map((m) => (
            <button
              key={m}
              className={`btn${audioMode === m ? ' active' : ''}`}
              onClick={() => controls.setAudio(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
