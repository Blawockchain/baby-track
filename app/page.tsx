'use client'

import { useTracker } from '@/hooks/useTracker'
import Sidebar from '@/components/Sidebar'
import Canvas from '@/components/Canvas'

export default function Home() {
  const {
    canvasRef,
    videoRef,
    offscreenRef,
    filterCanvasRef,
    videoInputRef,
    uiState,
    controls,
    toggleTheme,
  } = useTracker()

  return (
    <div id="app" className={uiState.theme}>
      <Sidebar uiState={uiState} controls={controls} toggleTheme={toggleTheme} />
      <Canvas
        canvasRef={canvasRef}
        videoRef={videoRef}
        offscreenRef={offscreenRef}
        filterCanvasRef={filterCanvasRef}
        videoInputRef={videoInputRef}
        uploadVideo={controls.uploadVideo}
        openCamera={controls.openCamera}
        playing={uiState.playing}
      />
    </div>
  )
}
