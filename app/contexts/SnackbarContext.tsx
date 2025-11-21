'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface SnackbarMessage {
  id: number;
  message: string;
  severity: AlertColor;
  autoHideDuration?: number;
}

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface SnackbarContextValue {
  showSnackbar: (message: string, severity?: AlertColor, duration?: number) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => Promise<boolean>;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: 'Confirm',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showSnackbar = useCallback((message: string, severity: AlertColor = 'info', duration: number = 5000) => {
    const id = Date.now();
    setSnackbars((prev) => [...prev, { id, message, severity, autoHideDuration: duration }]);
  }, []);

  const showError = useCallback((message: string) => {
    showSnackbar(message, 'error');
  }, [showSnackbar]);

  const showSuccess = useCallback((message: string) => {
    showSnackbar(message, 'success');
  }, [showSnackbar]);

  const showWarning = useCallback((message: string) => {
    showSnackbar(message, 'warning');
  }, [showSnackbar]);

  const showInfo = useCallback((message: string) => {
    showSnackbar(message, 'info');
  }, [showSnackbar]);

  const showConfirm = useCallback((message: string, onConfirm: () => void, title: string = 'Confirm') => {
    return new Promise<boolean>((resolve) => {
      setConfirmDialog({
        open: true,
        title,
        message,
        onConfirm: () => {
          onConfirm();
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          resolve(false);
        },
      });
    });
  }, []);

  const handleClose = (id: number) => {
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
  };

  return (
    <SnackbarContext.Provider
      value={{
        showSnackbar,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        showConfirm,
      }}
    >
      {children}

      {/* Render stacked snackbars */}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          open={true}
          autoHideDuration={snackbar.autoHideDuration}
          onClose={() => handleClose(snackbar.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            top: `${24 + index * 70}px !important`,
          }}
        >
          <Alert
            onClose={() => handleClose(snackbar.id)}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              minWidth: '300px',
              backgroundColor:
                snackbar.severity === 'error' ? '#FF3B30' :
                snackbar.severity === 'success' ? '#34C759' :
                snackbar.severity === 'warning' ? '#FF9500' :
                '#007AFF',
              color: '#FFFFFF',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              '& .MuiAlert-icon': {
                color: '#FFFFFF',
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={confirmDialog.onCancel}
        PaperProps={{
          sx: {
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: '#FFFFFF', borderBottom: '1px solid #2A2A2A' }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ color: '#B3B3B3' }}>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #2A2A2A' }}>
          <Button
            onClick={confirmDialog.onCancel}
            sx={{
              color: '#B3B3B3',
              '&:hover': { background: 'rgba(255, 255, 255, 0.05)' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            sx={{
              background: '#FF3B30',
              '&:hover': { background: '#E6342A' },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}
