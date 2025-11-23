'use client';

import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Id } from '@/convex/_generated/dataModel';

interface UseQuoteExportOptions {
  jobId: Id<'jobs'>;
  jobNumber: string;
  customerName?: string;
}

interface ExportState {
  isExporting: boolean;
  error: string | null;
}

export const useQuoteExport = ({ jobId, jobNumber, customerName }: UseQuoteExportOptions) => {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    error: null,
  });

  // Generate safe filename
  const getSafeFilename = (extension: 'pdf' | 'jpg') => {
    const safeName = customerName
      ? customerName.replace(/[^a-zA-Z0-9]/g, '_')
      : 'Customer';
    return `Quote_${jobNumber}_${safeName}.${extension}`;
  };

  // Export to PDF via API route
  const exportToPDF = useCallback(async () => {
    setState({ isExporting: true, error: null });

    try {
      const response = await fetch(`/api/export/quote/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getSafeFilename('pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setState({ isExporting: false, error: null });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setState({
        isExporting: false,
        error: error instanceof Error ? error.message : 'Failed to export PDF',
      });
    }
  }, [jobId, jobNumber, customerName]);

  // Export to JPG using html2canvas
  const exportToJPG = useCallback(async (elementRef: React.RefObject<HTMLElement | null>) => {
    if (!elementRef.current) {
      setState({
        isExporting: false,
        error: 'Element not found for export',
      });
      return;
    }

    setState({ isExporting: true, error: null });

    try {
      // Capture the element as canvas
      const canvas = await html2canvas(elementRef.current, {
        scale: 3, // High resolution for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 800,
        windowHeight: elementRef.current.scrollHeight,
      });

      // Convert to JPG blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setState({
              isExporting: false,
              error: 'Failed to create image',
            });
            return;
          }

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = getSafeFilename('jpg');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setState({ isExporting: false, error: null });
        },
        'image/jpeg',
        0.95 // Quality: 0-1 (95% quality)
      );
    } catch (error) {
      console.error('Error exporting JPG:', error);
      setState({
        isExporting: false,
        error: error instanceof Error ? error.message : 'Failed to export JPG',
      });
    }
  }, [jobNumber, customerName]);

  // Export JPG to PDF (for better compatibility)
  const exportJPGasPDF = useCallback(async (elementRef: React.RefObject<HTMLElement | null>) => {
    if (!elementRef.current) {
      setState({
        isExporting: false,
        error: 'Element not found for export',
      });
      return;
    }

    setState({ isExporting: true, error: null });

    try {
      // Capture the element as canvas
      const canvas = await html2canvas(elementRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 800,
        windowHeight: elementRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      pdf.save(getSafeFilename('pdf'));

      setState({ isExporting: false, error: null });
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      setState({
        isExporting: false,
        error: error instanceof Error ? error.message : 'Failed to export as PDF',
      });
    }
  }, [jobNumber, customerName]);

  return {
    exportToPDF,
    exportToJPG,
    exportJPGasPDF,
    isExporting: state.isExporting,
    error: state.error,
  };
};
