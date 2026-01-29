
import React, { useRef, useState, useEffect } from 'react';

interface BackgroundRemoverProps {
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
  onCancel: () => void;
}

export const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tolerance, setTolerance] = useState(30);
  const [targetColor, setTargetColor] = useState<{ r: number, g: number, b: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      if (targetColor) applyChromaKey();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const applyChromaKey = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !targetColor) return;

    // Reset to original image first
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diff = Math.sqrt(
          Math.pow(r - targetColor.r, 2) +
          Math.pow(g - targetColor.g, 2) +
          Math.pow(b - targetColor.b, 2)
        );

        if (diff < tolerance) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
    img.src = imageUrl;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setTargetColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
  };

  useEffect(() => {
    if (targetColor) applyChromaKey();
  }, [tolerance, targetColor]);

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="relative group rounded-[2.5rem] overflow-hidden border-4 border-slate-800 shadow-2xl bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-repeat">
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-crosshair max-h-[60vh] object-contain"
        />
        {!targetColor && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <p className="bg-white text-black px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-2xl">Tap a color to remove it</p>
          </div>
        )}
      </div>

      <div className="card p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="w-full sm:w-1/2 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>Sensitivity</label>
              <span className="font-bold text-sm" style={{color: 'var(--accent-primary)'}}>{tolerance}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="150" 
              value={tolerance} 
              onChange={(e) => setTolerance(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg cursor-pointer"
              style={{accentColor: 'var(--accent-primary)'}}
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onCancel} className="flex-1 sm:flex-none btn-secondary px-6 py-3 text-sm font-medium">Cancel</button>
            <button onClick={handleExport} className="flex-1 sm:flex-none btn-primary px-8 py-3 text-sm font-semibold">Apply & Save</button>
          </div>
        </div>
        <p className="text-xs text-center" style={{color: 'var(--text-muted)'}}>Non-AI Color Keying: Works best with solid backgrounds</p>
      </div>
    </div>
  );
};
