
import React, { useRef, useState } from 'react';
import { useToast } from './ui/toast';
import { useModal } from './ui/use-modal';
import { AlertModal } from './ui/modal';

interface VideoSnapshotProps {
  onCapture: (base64: string) => void;
}

export const VideoSnapshot: React.FC<VideoSnapshotProps> = ({ onCapture }) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const { showError } = useToast();
  const { alertModal, showAlert, closeAlert } = useModal();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };



  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      setIsCapturing(true);
      
      // Ensure we use the actual video dimensions
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      if (width === 0 || height === 0) {
        showAlert('Video Error', 'Video dimensions not detected. Please play the video for a second.', 'warning');
        setIsCapturing(false);
        return;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (ctx) {
        try {
          // Draw the current frame from the video onto the canvas
          ctx.drawImage(video, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          
          // Small delay for visual feedback "flash"
          setTimeout(() => {
            onCapture(dataUrl);
            setIsCapturing(false);
          }, 300);
        } catch (err) {
          console.error("Canvas capture operation failed");
          showAlert('Capture Failed', 'Could not capture frame. Try a different video format.', 'error');
          setIsCapturing(false);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {!videoSrc ? (
        <div 
          className="upload-area"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('video/')) {
              const url = URL.createObjectURL(file);
              setVideoSrc(url);
            }
          }}
        >
          <input 
            type="file" 
            accept="video/*" 
            onChange={(e) => {
              handleFileUpload(e);
              // Reset input to allow selecting the same file again
              if (e.target) {
                e.target.value = '';
              }
            }} 
            className="hidden" 
            id="video-upload"
            style={{position: 'absolute', opacity: 0, width: 0, height: 0}}
          />
          <label 
            htmlFor="video-upload" 
            className="cursor-pointer flex flex-col items-center w-full h-full relative z-10"
            onClick={(e) => {
              // Ensure click works even if label association fails
              const input = document.getElementById('video-upload') as HTMLInputElement;
              if (input && e.target === e.currentTarget) {
                input.click();
              }
            }}
          >
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: 'var(--accent-primary)'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div className="text-base font-medium mb-2" style={{color: 'var(--text-primary)'}}>
              Drop your video here, or click to browse
            </div>
            <div className="text-sm" style={{color: 'var(--text-muted)'}}>
              Supports MP4, MOV, AVI, WebM (Max 100MB)
            </div>
          </label>

        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video shadow-sm" style={{border: '1px solid var(--border-primary)'}}>
            <video 
              ref={videoRef} 
              src={videoSrc} 
              controls 
              className={`w-full h-full transition-opacity duration-300 ${isCapturing ? 'opacity-50' : 'opacity-100'}`}
              playsInline
            />
            {isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                 <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin" style={{color: 'var(--accent-primary)'}}></div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs" style={{background: 'var(--accent-light)', color: 'var(--accent-primary)'}}>
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
              </div>
              <p className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>Pause at the best moment and click capture</p>
            </div>
            <button
              onClick={captureFrame}
              disabled={isCapturing}
              className="btn-primary px-6 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use This Frame
            </button>
          </div>
          <button 
            onClick={() => { setVideoSrc(null); setIsCapturing(false); }}
            className="w-full text-center text-sm font-medium transition-colors" style={{color: 'var(--text-muted)'}}
          >
            Cancel & Upload New Video
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Modal Component */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText={alertModal.confirmText}
      />
    </div>
  );
};
