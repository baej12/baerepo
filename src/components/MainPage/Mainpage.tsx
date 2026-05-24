import './Mainpage.css';
import { PdfViewer } from '../PdfViewer/PdfViewer';
import { AboutSection } from '../AboutSection/AboutSection';
import { ExperienceSection } from '../ExperienceSection/ExperienceSection';
import { ProjectsSection } from '../ProjectsSection/ProjectsSection';
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Job, Project, AboutContent, Profile } from '../../types/content';
import jobsData from '../../data/jobs';
import projectsData from '../../data/projects';
import aboutData from '../../data/about';
import profileData from '../../data/profile';

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com';
const RESUME_URL_RESPONSE_KEYS = ['url', 'resumeUrl', 'resume_url', 'downloadUrl', 'download_url'] as const;
let turnstileScriptPromise: Promise<void> | null = null;

declare global {
    interface Window {
        turnstile?: {
            render: (element: HTMLElement, options: {
                sitekey: string;
                callback?: (token: string) => void;
                'expired-callback'?: () => void;
                'error-callback'?: () => void;
                theme?: 'light' | 'dark' | 'auto';
            }) => string;
            remove: (widgetId: string) => void;
        };
    }
}

const addPreconnect = (href: string) => {
    if (typeof document === 'undefined' || !href) return;
    if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
};

const loadTurnstileScript = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.resolve();
    }

    if (window.turnstile) {
        return Promise.resolve();
    }

    if (turnstileScriptPromise) {
        return turnstileScriptPromise;
    }

    turnstileScriptPromise = new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${TURNSTILE_SCRIPT_SRC}"]`) as HTMLScriptElement | null;
        const script = existingScript || document.createElement('script');

        const onLoad = () => resolve();
        const onError = () => {
            turnstileScriptPromise = null;
            reject(new Error('Unable to load CAPTCHA script.'));
        };

        script.addEventListener('load', onLoad, { once: true });
        script.addEventListener('error', onError, { once: true });

        if (!existingScript) {
            script.src = TURNSTILE_SCRIPT_SRC;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    });

    return turnstileScriptPromise;
};

const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

const getRouteScrollContainer = () => document.querySelector('.App-route-shell') as HTMLElement | null;

const getSectionReferenceElement = (target: HTMLElement) => (
    (target.querySelector('.section-heading') as HTMLElement | null)
    || (target.querySelector('h2, h3, h1') as HTMLElement | null)
    || target
);

const scrollToSectionReference = (referenceEl: HTMLElement, behavior: ScrollBehavior) => {
    if (!isMobileViewport()) {
        referenceEl.scrollIntoView({ behavior, block: 'start' });
        return;
    }

    const routeShell = getRouteScrollContainer();
    if (!routeShell) {
        referenceEl.scrollIntoView({ behavior, block: 'start' });
        return;
    }

    const shellTop = routeShell.getBoundingClientRect().top;
    const currentTop = routeShell.scrollTop;
    const targetTop = currentTop + referenceEl.getBoundingClientRect().top - shellTop - 12;

    routeShell.scrollTo({
        top: Math.max(0, targetTop),
        behavior,
    });
};

const Mainpage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('about');
    const activeSectionRef = useRef<string>('about');
    const manualScrollRef = useRef<boolean>(false);
    const manualScrollTargetRef = useRef<string | null>(null);
    const manualScrollTimerRef = useRef<number | null>(null);
    const [sections, setSections] = useState<{ id: string; label: string }[]>([]);
    const [showPdfViewer, setShowPdfViewer] = useState<boolean>(false);
    const [showResumeCaptcha, setShowResumeCaptcha] = useState<boolean>(false);
    const [resumeViewerUrl, setResumeViewerUrl] = useState<string>('');
    const [captchaToken, setCaptchaToken] = useState<string>('');
    const [resumeRequestError, setResumeRequestError] = useState<string>('');
    const [isCaptchaWidgetReady, setIsCaptchaWidgetReady] = useState<boolean>(false);
    const [isResumeRequestPending, setIsResumeRequestPending] = useState<boolean>(false);
    const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
    const turnstileWidgetIdRef = useRef<string | null>(null);
    const resumeScrollPositionRef = useRef<{ top: number; left: number } | null>(null);
    
    const jobs: Job[] = jobsData;
    const projects: Project[] = projectsData;
    const about: AboutContent = aboutData;
    const profile: Profile = profileData;
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
    const hasTurnstileSiteKey = turnstileSiteKey.trim().length > 0;

    const parseResumeUrl = (payload: unknown): string | null => {
        if (typeof payload === 'string') {
            const trimmed = payload.trim();
            return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : null;
        }

        if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            for (const key of RESUME_URL_RESPONSE_KEYS) {
                const value = record[key];
                if (typeof value === 'string') {
                    const trimmed = value.trim();
                    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                        return trimmed;
                    }
                }
            }
        }

        return null;
    };

    const requestResumeUrl = async () => {
        if (!captchaToken) {
            setResumeRequestError('Please complete the CAPTCHA challenge first.');
            return;
        }

        setResumeRequestError('');
        setIsResumeRequestPending(true);

        try {
            const response = await fetch(profile.resumeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ captchaToken }),
            });

            if (!response.ok) {
                throw new Error(`Resume endpoint failed with status ${response.status}.`);
            }

            const contentType = response.headers.get('content-type') || '';
            let urlFromResponse: string | null = null;

            if (contentType.includes('application/json')) {
                const payload = await response.json();
                urlFromResponse = parseResumeUrl(payload);
            } else {
                const text = await response.text();
                urlFromResponse = parseResumeUrl(text);
                if (!urlFromResponse) {
                    try {
                        const payload = JSON.parse(text);
                        urlFromResponse = parseResumeUrl(payload);
                    } catch (e) {
                        urlFromResponse = null;
                    }
                }
            }

            if (!urlFromResponse) {
                throw new Error('No resume URL was found in the endpoint response.');
            }

            setResumeViewerUrl(urlFromResponse);
            setShowResumeCaptcha(false);
            setShowPdfViewer(true);
        } catch (e) {
            setResumeRequestError('Unable to verify challenge or load resume. Please try again.');
        } finally {
            setIsResumeRequestPending(false);
        }
    };

    useEffect(() => {
        if (!hasTurnstileSiteKey) {
            return;
        }

        addPreconnect(TURNSTILE_ORIGIN);

        try {
            addPreconnect(new URL(profile.resumeUrl).origin);
        } catch (e) {}

        const preloadTimer = window.setTimeout(() => {
            loadTurnstileScript().catch(() => {});
        }, 300);

        return () => window.clearTimeout(preloadTimer);
    }, [hasTurnstileSiteKey, profile.resumeUrl]);

    // Listen for custom event to open resume
    useEffect(() => {
        const handleOpenResume = () => {
            setCaptchaToken('');
            setResumeRequestError('');
            setIsCaptchaWidgetReady(false);
            setShowResumeCaptcha(true);
        };
        window.addEventListener('openResume', handleOpenResume as EventListener);
        return () => window.removeEventListener('openResume', handleOpenResume as EventListener);
    }, []);

    useEffect(() => {
        if (!showResumeCaptcha || !hasTurnstileSiteKey) {
            return;
        }

        const renderTurnstile = () => {
            if (!window.turnstile || !turnstileContainerRef.current) {
                return;
            }

            if (turnstileWidgetIdRef.current) {
                window.turnstile.remove(turnstileWidgetIdRef.current);
                turnstileWidgetIdRef.current = null;
            }

            turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
                sitekey: turnstileSiteKey,
                theme: 'dark',
                callback: (token: string) => {
                    setCaptchaToken(token);
                    setResumeRequestError('');
                },
                'expired-callback': () => {
                    setCaptchaToken('');
                    setResumeRequestError('CAPTCHA expired. Please complete it again.');
                },
                'error-callback': () => {
                    setCaptchaToken('');
                    setResumeRequestError('CAPTCHA failed to load. Please refresh and try again.');
                },
            });
            setIsCaptchaWidgetReady(true);
        };

        if (window.turnstile) {
            renderTurnstile();
            return;
        }

        let isCanceled = false;
        loadTurnstileScript()
            .then(() => {
                if (!isCanceled) {
                    renderTurnstile();
                }
            })
            .catch(() => {
                if (!isCanceled) {
                    setResumeRequestError('CAPTCHA failed to load. Please refresh and try again.');
                }
            });

        return () => {
            isCanceled = true;
        };
    }, [showResumeCaptcha, hasTurnstileSiteKey, turnstileSiteKey]);

    useEffect(() => {
        if (showResumeCaptcha) {
            const routeShell = document.querySelector('.App-route-shell') as HTMLElement | null;
            const previousBodyOverflow = document.body.style.overflow;
            const previousHtmlOverflow = document.documentElement.style.overflow;

            if (!resumeScrollPositionRef.current && routeShell) {
                resumeScrollPositionRef.current = {
                    top: routeShell.scrollTop,
                    left: routeShell.scrollLeft,
                };
            }

            try {
                document.body.classList.add('resume-captcha-open');
                document.documentElement.classList.add('resume-captcha-open');
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
            } catch (e) {}

            return () => {
                try {
                    document.body.classList.remove('resume-captcha-open');
                    document.documentElement.classList.remove('resume-captcha-open');
                    document.body.style.overflow = previousBodyOverflow;
                    document.documentElement.style.overflow = previousHtmlOverflow;
                } catch (e) {}
            };
        }

        return;
    }, [showResumeCaptcha]);

    useEffect(() => {
        if (showPdfViewer) {
            const routeShell = document.querySelector('.App-route-shell') as HTMLElement | null;

            if (!resumeScrollPositionRef.current && routeShell) {
                resumeScrollPositionRef.current = {
                    top: routeShell.scrollTop,
                    left: routeShell.scrollLeft,
                };
            }
        }
    }, [showPdfViewer]);

    const restoreResumeScrollPosition = () => {
        const savedPosition = resumeScrollPositionRef.current;
        resumeScrollPositionRef.current = null;

        if (!savedPosition) {
            return;
        }

        requestAnimationFrame(() => {
            const routeShell = document.querySelector('.App-route-shell') as HTMLElement | null;
            if (routeShell) {
                routeShell.scrollTo(savedPosition);
                return;
            }

            window.scrollTo(savedPosition);
        });
    };

    useEffect(() => {
        if (showResumeCaptcha) {
            return;
        }

        if (turnstileWidgetIdRef.current && window.turnstile) {
            window.turnstile.remove(turnstileWidgetIdRef.current);
            turnstileWidgetIdRef.current = null;
        }
    }, [showResumeCaptcha]);

    // compute header offset and expose as CSS variable so scroll-margin-top can handle alignment
    useEffect(() => {
        const getHeaderEl = () => document.querySelector('.header-name') as HTMLElement | null;

        const setHeaderOffset = () => {
            const headerEl = getHeaderEl();
            if (!headerEl) return;
            const top = Math.round(headerEl.getBoundingClientRect().top);
            document.documentElement.style.setProperty('--header-top-offset', `${top}px`);
        };

        // Initial set
        setHeaderOffset();

        // Update when fonts load (can change layout)
        if (document.fonts && typeof document.fonts.ready?.then === 'function') {
            document.fonts.ready.then(setHeaderOffset).catch(() => {});
        }

        // ResizeObserver to detect size/layout changes of the header or document
        let ro: ResizeObserver | null = null;
        try {
            if (typeof ResizeObserver !== 'undefined') {
                ro = new ResizeObserver(() => setHeaderOffset());
                const headerEl = getHeaderEl();
                if (headerEl) ro.observe(headerEl);
                ro.observe(document.documentElement);
            }
        } catch (e) {
            ro = null;
        }

        // Also listen to window resize and transitionend (for sidebar transitions)
        window.addEventListener('resize', setHeaderOffset);
        window.addEventListener('transitionend', setHeaderOffset);

        return () => {
            window.removeEventListener('resize', setHeaderOffset);
            window.removeEventListener('transitionend', setHeaderOffset);
            if (ro) ro.disconnect();
        };
    }, []);

    // On initial load (or when hash changes) ensure the hashed section is scrolled into view
    useEffect(() => {
        const scrollToHashSection = (hash?: string) => {
            const h = (hash !== undefined ? hash : window.location.hash) || '';
            if (!h) return;
            const target = document.querySelector(h) as HTMLElement | null;
            if (!target) return;
            const referenceEl = getSectionReferenceElement(target);

            // Wait a short moment so CSS variable and layout settle (fonts, resize observers)
            window.setTimeout(() => {
                // Use instant (auto) behavior on load so the browser doesn't animate from top-of-page to the hash position
                scrollToSectionReference(referenceEl, 'auto');

                // Final precise correction: align reference top with header top if header exists
                const header = document.querySelector('.header-name') as HTMLElement | null;
                if (header && !isMobileViewport()) {
                    const delta = referenceEl.getBoundingClientRect().top - header.getBoundingClientRect().top;
                    if (Math.abs(delta) > 1) {
                        window.scrollBy({ top: -delta, behavior: 'auto' });
                    }
                }
            }, 60);
        };

        // Run on mount
        scrollToHashSection();

        // Also handle future hash changes (back/forward navigation)
        const onHashChange = () => scrollToHashSection(window.location.hash);
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    // Build nav sections list dynamically from document sections with an id
    useEffect(() => {
        const els = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];
        const secs = els.map(el => {
            const heading = (el.querySelector('.section-heading') as HTMLElement | null)
                || (el.querySelector('h2, h3, h1') as HTMLElement | null);
            const label = heading ? (heading.textContent || el.id) : el.id;
            return { id: el.id, label: label.trim() };
        });
        setSections(secs);
    }, []);

    // Detect sections and track active section based on scroll position (visible-height based)
    useEffect(() => {
        const sectionEls = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];
        if (sectionEls.length === 0) return;

        let rafId: number | null = null;
        let scrollContainer: Window | HTMLElement = window;

        // find the actual scrollable ancestor (if any) of the first section
        const findScrollContainer = (el: HTMLElement | null): Window | HTMLElement => {
            let cur: HTMLElement | null = el;
            while (cur && cur !== document.body && cur !== document.documentElement) {
                const style = window.getComputedStyle(cur);
                const overflowY = style.overflowY;
                if (overflowY === 'auto' || overflowY === 'scroll') return cur;
                cur = cur.parentElement;
            }
            return window;
        };

        scrollContainer = findScrollContainer(sectionEls[0]);

        const updateActiveFromScroll = () => {
            const isWindow = scrollContainer === window;
            const vh = isWindow ? window.innerHeight : (scrollContainer as HTMLElement).clientHeight;
            let bestId = sectionEls[0].id;

            // Get header position for top-alignment reference
            const header = document.querySelector('.header-name') as HTMLElement | null;
            const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
            const threshold = headerBottom + 50; // 50px below header

            // Find the first section whose top is at or above the threshold with visible content
            // OR the first section that's currently visible
            let foundSection = false;
            for (const el of sectionEls) {
                const r = el.getBoundingClientRect();
                const visibleTop = Math.max(r.top, 0);
                const visibleBottom = Math.min(r.bottom, vh);
                const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                
                // If section has any visibility and its top is at/above threshold, it's the active one
                if (visibleHeight > 0 && r.top <= threshold) {
                    bestId = el.id;
                    foundSection = true;
                    // Don't break - keep going to find the last one above threshold
                }
            }
            
            // If no section was above threshold, use the first visible one
            if (!foundSection) {
                for (const el of sectionEls) {
                    const r = el.getBoundingClientRect();
                    const visibleTop = Math.max(r.top, 0);
                    const visibleBottom = Math.min(r.bottom, vh);
                    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                    
                    if (visibleHeight > 0) {
                        bestId = el.id;
                        break;
                    }
                }
            }

            // If a manual nav click just triggered a smooth scroll, avoid immediately
            // overriding the clicked active state until the target becomes noticeably visible
            if (manualScrollRef.current) {
                const target = manualScrollTargetRef.current;
                // If the target has become the best visible and is noticeably visible, accept it
                if (target && bestId === target) {
                    manualScrollRef.current = false;
                    manualScrollTargetRef.current = null;
                    if (manualScrollTimerRef.current !== null) {
                        window.clearTimeout(manualScrollTimerRef.current);
                        manualScrollTimerRef.current = null;
                    }
                    if (activeSectionRef.current !== bestId) {
                        activeSectionRef.current = bestId;
                        setActiveSection(bestId);
                        // If a nav item still has focus from a recent click, blur it
                        const ae = document.activeElement as HTMLElement | null;
                        if (ae && ae.classList && ae.classList.contains('page-navigator')) {
                            ae.blur();
                        }
                    }
                }
                // otherwise wait until the user scroll finishes or the timeout clears the manual flag
                return;
            }

            if (activeSectionRef.current !== bestId) {
                activeSectionRef.current = bestId;
                setActiveSection(bestId);
                const ae = document.activeElement as HTMLElement | null;
                if (ae && ae.classList && ae.classList.contains('page-navigator')) {
                    ae.blur();
                }
            }
        };

        const onScroll = () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateActiveFromScroll);
        };

        // Short polling fallback: start brief RAF-driven polling when user interaction is detected
        const pollingRef = { id: null as number | null };
        const startPolling = () => {
            if (pollingRef.id !== null) return;
            let start = performance.now();
            const tick = () => {
                updateActiveFromScroll();
                if (performance.now() - start < 800) {
                    pollingRef.id = requestAnimationFrame(tick);
                } else {
                    if (pollingRef.id !== null) cancelAnimationFrame(pollingRef.id);
                    pollingRef.id = null;
                }
            };
            pollingRef.id = requestAnimationFrame(tick);
        };

        if (scrollContainer === window) {
            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onScroll);
            // also listen for wheel/touch events as a fallback
            window.addEventListener('wheel', onScroll, { passive: true });
            window.addEventListener('touchmove', onScroll, { passive: true });
            // trigger short polling on wheel/touchstart for cases where scroll events are suppressed
            window.addEventListener('wheel', startPolling, { passive: true });
            window.addEventListener('touchstart', startPolling, { passive: true });
            document.addEventListener('scroll', onScroll, { passive: true });
        } else {
            const sc = scrollContainer as HTMLElement;
            sc.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onScroll);
            sc.addEventListener('wheel', onScroll, { passive: true });
            sc.addEventListener('touchmove', onScroll, { passive: true });
            sc.addEventListener('wheel', startPolling, { passive: true });
            sc.addEventListener('touchstart', startPolling, { passive: true });
            // also listen to document scroll as a last resort
            document.addEventListener('scroll', onScroll, { passive: true });
        }

        // initial check
        updateActiveFromScroll();

        return () => {
            if (scrollContainer === window) {
                window.removeEventListener('scroll', onScroll);
                window.removeEventListener('resize', onScroll);
                window.removeEventListener('wheel', onScroll);
                window.removeEventListener('touchmove', onScroll);
                window.removeEventListener('wheel', startPolling);
                window.removeEventListener('touchstart', startPolling);
                document.removeEventListener('scroll', onScroll);
            } else {
                (scrollContainer as HTMLElement).removeEventListener('scroll', onScroll);
                window.removeEventListener('resize', onScroll);
                (scrollContainer as HTMLElement).removeEventListener('wheel', onScroll);
                (scrollContainer as HTMLElement).removeEventListener('touchmove', onScroll);
                (scrollContainer as HTMLElement).removeEventListener('wheel', startPolling);
                (scrollContainer as HTMLElement).removeEventListener('touchstart', startPolling);
                document.removeEventListener('scroll', onScroll);
            }
            if (rafId !== null) cancelAnimationFrame(rafId);
            if (pollingRef.id !== null) cancelAnimationFrame(pollingRef.id);
        };
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const anchor = e.currentTarget as HTMLAnchorElement;
        const href = anchor.getAttribute('href') || '';
        if (!href.startsWith('#')) return;

        const target = document.querySelector(href) as HTMLElement | null;
        if (!target) return;

        const referenceEl = getSectionReferenceElement(target);

        // Immediately set the active section when clicking
        const sectionId = href.slice(1);
        // click registered

        // Mark that a manual (click-initiated) scroll is in progress so the scroll
        // updater won't immediately override the clicked state.
        manualScrollRef.current = true;
        manualScrollTargetRef.current = sectionId;
        if (manualScrollTimerRef.current !== null) {
            window.clearTimeout(manualScrollTimerRef.current);
            manualScrollTimerRef.current = null;
        }
        manualScrollTimerRef.current = window.setTimeout(() => {
            manualScrollRef.current = false;
            manualScrollTargetRef.current = null;
            manualScrollTimerRef.current = null;
        }, 1400);

        // Immediately set active section so click feedback is instant.
        activeSectionRef.current = sectionId;
        setActiveSection(sectionId);

        scrollToSectionReference(referenceEl, 'smooth');
        const { pathname, search } = window.location;
        window.history.replaceState(null, '', `${pathname}${search}${href}`);
    };

    return (
        <div className="mainpage">
        <div className="left-side">
            <div className="sticky-wrapper">
                <header className="header-section">
                    <h1 className="header-name">
                        {profile.name}
                    </h1>
                    <h2 className="header-title">
                        {profile.title}
                    </h2>
                    <p className="header-tagline">
                        {profile.tagline}
                    </p>
                </header>

                <nav className="nav-items" aria-label="Page navigation">
                        <ul>
                            {sections.length > 0 ? sections.map(s => (
                                <li key={s.id}><a className={`page-navigator ${activeSection === s.id ? 'active' : ''}`} href={`#${s.id}`} onClick={handleNavClick}>{s.label}</a></li>
                            )) : (
                                <>
                                    <li><a className={`page-navigator ${activeSection === 'about' ? 'active' : ''}`} href="#about" onClick={handleNavClick}>About</a></li>
                                    <li><a className={`page-navigator ${activeSection === 'experience' ? 'active' : ''}`} href="#experience" onClick={handleNavClick}>Experience</a></li>
                                    <li><a className={`page-navigator ${activeSection === 'projects' ? 'active' : ''}`} href="#projects" onClick={handleNavClick}>Public Projects</a></li>
                                </>
                            )}
                        </ul>
                </nav>

                <div className="route-links" aria-label="Other pages">
                    <Link className="route-link history-route-link" to="/history">
                        <span>Open history page</span>
                        <span className="route-link-icon" aria-hidden="true">↗</span>
                    </Link>
                </div>

                {/* <span style ={{position: "sticky", marginTop: "50vh"}}>
                    <a href="https://www.linkedin.com/in/jhbbae/">
                        <img src={liicon} width="42" height="42" style={{marginRight:'2rem'}} 
                            alt = "go to linkedin profile"
                            className = "soc-link"
                        />
                    </a>
                    <a href="https://github.com/baej12">
                        <img src={githubicon} width="42" height="42" style={{}}
                            alt = "go to github profile"
                            className = "soc-link"
                        />
                    </a>
                </span> */}
            </div>
        </div>
        <div className="right-side">
            <AboutSection content={about} />
            <ExperienceSection jobs={jobs} />
            <ProjectsSection projects={projects} />
        </div>
        {showResumeCaptcha && createPortal((
            <div className="resume-captcha-overlay" role="dialog" aria-modal="true" aria-label="Resume access verification">
                <div className="resume-captcha-modal">
                    <h3>Verify Before Viewing Resume</h3>
                    <p>Please complete the CAPTCHA challenge to continue.</p>

                    {hasTurnstileSiteKey ? (
                        <div className="resume-captcha-widget">
                            {!isCaptchaWidgetReady && (
                                <div className="resume-captcha-loading" aria-live="polite">
                                    Loading verification...
                                </div>
                            )}
                            <div ref={turnstileContainerRef} />
                        </div>
                    ) : (
                        <p className="resume-captcha-error">
                            CAPTCHA is not configured yet. Set VITE_TURNSTILE_SITE_KEY to enable protected resume access.
                        </p>
                    )}

                    {resumeRequestError && <p className="resume-captcha-error">{resumeRequestError}</p>}

                    <div className="resume-captcha-actions">
                        <button
                            type="button"
                            className="resume-captcha-button secondary"
                            onClick={() => {
                                setShowResumeCaptcha(false);
                                restoreResumeScrollPosition();
                            }}
                            disabled={isResumeRequestPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="resume-captcha-button primary"
                            onClick={requestResumeUrl}
                            disabled={!hasTurnstileSiteKey || !captchaToken || isResumeRequestPending}
                        >
                            {isResumeRequestPending ? 'Verifying...' : 'Continue'}
                        </button>
                    </div>
                </div>
            </div>
        ), document.body)}
        {showPdfViewer && (
            <PdfViewer 
                url={resumeViewerUrl}
                onClose={() => {
                    setShowPdfViewer(false);
                    setResumeViewerUrl('');
                    restoreResumeScrollPosition();
                }}
            />
        )}
        </div>
    );
};

export default Mainpage;
