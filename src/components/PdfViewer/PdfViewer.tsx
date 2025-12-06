import React from 'react';
import './PdfViewer.css';

interface PdfViewerProps {
    url: string;
    onClose: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, onClose }) => {
    return (
        <div className="pdf-viewer-overlay" onClick={onClose}>
            <div className="pdf-viewer-container" onClick={(e) => e.stopPropagation()}>
                <button className="pdf-viewer-close" onClick={onClose} aria-label="Close PDF viewer">
                    ×
                </button>
                <iframe
                    src={url}
                    className="pdf-viewer-frame"
                    title="Resume PDF"
                />
            </div>
        </div>
    );
};
