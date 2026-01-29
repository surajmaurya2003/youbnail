
import React, { useRef, useState, useEffect } from 'react';
import { SelectionArea } from '../types';

interface ImageEditorProps {
  imageUrl: string;
  onSelectionComplete: (area: SelectionArea | null) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSelectionComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentArea, setCurrentArea] = useState<SelectionArea | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPos({ x, y });
    setCurrentArea({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startPos || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newArea = {
      x: Math.min(x, startPos.x),
      y: Math.min(y, startPos.y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y)
    };
    
    setCurrentArea(newArea);
  };

  const handleMouseUp = () => {
    if (currentArea && currentArea.width > 5 && currentArea.height > 5) {
      onSelectionComplete(currentArea);
    } else {
      onSelectionComplete(null);
    }
    setStartPos(null);
  };

  return (
    <div 
      ref={containerRef}
      className="relative cursor-crosshair select-none w-full h-full overflow-hidden rounded-xl bg-black"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <img 
        src={imageUrl} 
        alt="Edit source" 
        className="w-full h-full object-contain pointer-events-none" 
      />
      
      {currentArea && (
        <div 
          className="absolute border-2 border-dashed bg-gray-100/30 shadow-lg"
          style={{
            borderColor: 'var(--accent-primary)',
            left: currentArea.x,
            top: currentArea.y,
            width: currentArea.width,
            height: currentArea.height
          }}
        >
          <div className="absolute -top-8 left-0 px-3 py-1 rounded text-white text-xs font-semibold" style={{background: 'var(--accent-primary)'}}>
            Selected Region
          </div>
        </div>
      )}
      
      {!currentArea && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40">
           <p className="text-white text-sm font-bold bg-black/60 px-4 py-2 rounded-full border border-white/20">
             Drag to select area to change
           </p>
        </div>
      )}
    </div>
  );
};
