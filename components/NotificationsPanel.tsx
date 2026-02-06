import React from 'react';
import { X, CheckCircle, XCircle, Clock, Download } from 'lucide-react';

interface GenerationNotification {
  id: string;
  prompt: string;
  progress: number;
  status: 'generating' | 'completed' | 'failed';
  result?: string;
  error?: string;
  startTime: number;
}

interface NotificationsPanelProps {
  generations: Map<string, GenerationNotification>;
  isOpen: boolean;
  onClose: () => void;
  onRemoveGeneration: (id: string) => void;
  onDownloadResult: (url: string) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  generations, 
  isOpen, 
  onClose, 
  onRemoveGeneration,
  onDownloadResult 
}) => {
  if (!isOpen) return null;

  const generationsList = Array.from(generations.values()).reverse(); // Show newest first
  const hasActiveGenerations = generationsList.some((g: GenerationNotification) => g.status === 'generating');

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-black border-l border-gray-700 z-50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Generation Progress</h3>
          {hasActiveGenerations && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto notification-panel p-4 space-y-3">
        {generationsList.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock size={32} className="mx-auto mb-2 opacity-50" />
            <p>No recent generations</p>
          </div>
        ) : (
          generationsList.map((generation: GenerationNotification) => (
            <GenerationCard
              key={generation.id}
              generation={generation}
              onRemove={() => onRemoveGeneration(generation.id)}
              onDownload={() => generation.result && onDownloadResult(generation.result)}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface GenerationCardProps {
  generation: GenerationNotification;
  onRemove: () => void;
  onDownload: () => void;
}

const GenerationCard: React.FC<GenerationCardProps> = ({ generation, onRemove, onDownload }) => {
  const getStatusIcon = () => {
    switch (generation.status) {
      case 'generating':
        return <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (generation.status) {
      case 'generating':
        return `${generation.progress}% complete`;
      case 'completed':
        return 'Ready to download';
      case 'failed':
        return generation.error || 'Generation failed';
    }
  };

  const getTimeAgo = () => {
    const elapsed = Date.now() - generation.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return `${seconds}s ago`;
  };

  return (
    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          {getStatusIcon()}
          <span className="text-xs font-medium text-gray-300">
            {getTimeAgo()}
          </span>
        </div>
        <button 
          onClick={onRemove}
          className="text-gray-500 hover:text-gray-300 p-1"
        >
          <X size={12} />
        </button>
      </div>
      
      <p className="text-sm text-white mb-2 line-clamp-2">
        {generation.prompt}
      </p>
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {getStatusText()}
        </p>
        
        {generation.status === 'completed' && generation.result && (
          <button 
            onClick={onDownload}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <Download size={12} />
            Download
          </button>
        )}
      </div>
      
      {generation.status === 'generating' && (
        <div className="mt-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${generation.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;