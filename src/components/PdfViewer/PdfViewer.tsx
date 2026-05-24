import React, { useEffect, useRef, useState } from 'react';
import './PdfViewer.css';

interface PdfViewerProps {
    url: string;
    onClose: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, onClose }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [zoom, setZoom] = useState<number>(1);
    const viewerUrl = url.includes('#') ? url : `${url}#view=FitH&zoom=page-width`;

    useEffect(() => {
        setIsLoaded(false);
        setZoom(1);
    }, [viewerUrl]);

    const zoomOut = () => setZoom(currentZoom => Math.max(0.75, Number((currentZoom - 0.15).toFixed(2))));
    const zoomIn = () => setZoom(currentZoom => Math.min(2.5, Number((currentZoom + 0.15).toFixed(2))));
    const resetZoom = () => setZoom(1);

    useEffect(() => {
        // Keep the PDF overlay modal-like so keyboard users can close it reliably.
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        try {
            document.body.classList.add('pdf-open');
            document.documentElement.classList.add('pdf-open');
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
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
                document.documentElement.classList.remove('pdf-open');
                document.body.style.overflow = previousBodyOverflow;
                document.documentElement.style.overflow = previousHtmlOverflow;
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
                <div className="pdf-viewer-toolbar" aria-label="Resume viewer controls">
                    <button type="button" onClick={zoomOut} aria-label="Zoom out" disabled={zoom <= 0.75}>
                        &minus;
                    </button>
                    <button type="button" onClick={resetZoom} aria-label="Fit resume to screen">
                        {Math.round(zoom * 100)}%
                    </button>
                    <button type="button" onClick={zoomIn} aria-label="Zoom in" disabled={zoom >= 2.5}>
                        +
                    </button>
                </div>
                {!isLoaded && (
                    <div className="pdf-viewer-loading" aria-live="polite">
                        <div className="pdf-viewer-loading-ring" aria-hidden="true" />
                        <p>Loading resume...</p>
                    </div>
                )}
                <div className="pdf-viewer-stage">
                    <div
                        className="pdf-viewer-frame-shell"
                        style={{
                            width: `${100 / zoom}%`,
                            height: `${100 / zoom}%`,
                            transform: `scale(${zoom})`,
                        }}
                    >
                        <iframe
                            ref={iframeRef}
                            src={viewerUrl}
                            className="pdf-viewer-frame"
                            title="Resume PDF"
                            onLoad={() => setIsLoaded(true)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
