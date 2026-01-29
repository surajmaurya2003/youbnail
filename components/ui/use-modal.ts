import { useState } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const useModal = () => {
  const [alertModal, setAlertModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [confirmModal, setConfirmModal] = useState<ModalState & { onConfirm: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    confirmText: string = 'OK'
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'warning',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Convenience methods
  const showSuccess = (title: string, message: string) => 
    showAlert(title, message, 'success');

  const showError = (title: string, message: string) => 
    showAlert(title, message, 'error');

  const showWarning = (title: string, message: string) => 
    showAlert(title, message, 'warning');

  const showInfo = (title: string, message: string) => 
    showAlert(title, message, 'info');

  return {
    alertModal,
    confirmModal,
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeAlert,
    closeConfirm,
  };
};