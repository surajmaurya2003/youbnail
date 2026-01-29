import React, { useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnEsc?: boolean;
  closeOnOverlay?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnEsc = true,
  closeOnOverlay = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-black rounded-lg shadow-lg p-6 w-full mx-4 ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
}) => {
  const icons = {
    success: <CheckCircle className="text-gray-600" size={24} />,
    error: <AlertCircle className="text-gray-800" size={24} />,
    warning: <AlertTriangle className="text-gray-700" size={24} />,
    info: <Info className="text-gray-600" size={24} />,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-start space-x-3">
        {icons[type]}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="default">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const icons = {
    danger: <AlertCircle className="text-gray-800" size={24} />,
    warning: <AlertTriangle className="text-gray-700" size={24} />,
    info: <Info className="text-gray-600" size={24} />,
  };

  const confirmButtonVariant = type === 'danger' ? 'destructive' : 'default';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-start space-x-3">
        {icons[type]}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button onClick={onClose} variant="outline">
          {cancelText}
        </Button>
        <Button onClick={handleConfirm} variant={confirmButtonVariant}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};