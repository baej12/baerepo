import React, { useEffect, useRef } from 'react';
import './PdfViewer.css';

interface PdfViewerProps {
    url: string;
    onClose: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, onClose }) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Keep the PDF overlay modal-like so keyboard users can close it reliably.
        try {
            document.body.classList.add('pdf-open');
            document.body.style.overflow = 'hidden';
        } catch (e) {}

        overlayRef.current?.focus();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKey, true);

        return () => {
            try {
                document.body.classList.remove('pdf-open');
                document.body.style.overflow = '';
            } catch (e) {}
            window.removeEventListener('keydown', handleKey, true);
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
                    src={url}
                    className="pdf-viewer-frame"
                    title="Resume PDF"
                />
            </div>
        </div>
    );
};
