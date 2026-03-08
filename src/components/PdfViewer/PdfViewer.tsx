import React, { useEffect, useRef } from 'react';
import './PdfViewer.css';

interface PdfViewerProps {
    url: string;
    onClose: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, onClose }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Keep the PDF overlay modal-like so keyboard users can close it reliably.
        try {
            document.body.classList.add('pdf-open');
            document.body.style.overflow = 'hidden';
        } catch (e) {}

        overlayRef.current?.focus();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }
        };

        // Add listener to window and document
        window.addEventListener('keydown', handleKey, true);
        document.addEventListener('keydown', handleKey, true);

        // Periodically check if focus is lost to iframe and reclaim it
        const focusCheckInterval = setInterval(() => {
            const activeElement = document.activeElement;
            const iframe = iframeRef.current;
            
            // If iframe has focus, refocus the overlay so Escape works
            if (activeElement === iframe) {
                overlayRef.current?.focus();
            }
        }, 100);

        return () => {
            try {
                document.body.classList.remove('pdf-open');
                document.body.style.overflow = '';
            } catch (e) {}
            window.removeEventListener('keydown', handleKey, true);
            document.removeEventListener('keydown', handleKey, true);
            clearInterval(focusCheckInterval);
        };
    }, [onClose]);

    return (
        <div
            ref={overlayRef}
            className="pdf-viewer-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Resume PDF viewer"
            tabIndex={-1}
        >
            <button
                className="pdf-viewer-close"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Close PDF viewer"
                type="button"
            >
                <span aria-hidden="true">&times;</span>
            </button>
            <div className="pdf-viewer-container" onClick={(e) => e.stopPropagation()}>
                <iframe
                    ref={iframeRef}
                    src={url}
                    className="pdf-viewer-frame"
                    title="Resume PDF"
                />
            </div>
        </div>
    );
};
