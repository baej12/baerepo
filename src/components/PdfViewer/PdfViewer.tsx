import React, { useEffect } from 'react';
import './PdfViewer.css';

interface PdfViewerProps {
    url: string;
    onClose: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, onClose }) => {
    useEffect(() => {
        // Add a class to the body so CSS can restore the OS cursor while PDF is open
        try {
            document.body.classList.add('pdf-open');
        } catch (e) {}
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKey);

        return () => {
            try {
                document.body.classList.remove('pdf-open');
            } catch (e) {}
            document.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    return (
        <div className="pdf-viewer-overlay" onClick={onClose}>
            <button
                className="pdf-viewer-close"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Close PDF viewer"
            >
                ×
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
