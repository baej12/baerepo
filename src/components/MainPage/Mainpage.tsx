import './Mainpage.css';
import { RepoList } from '../RepoList/RepoList';
import { PdfViewer } from '../PdfViewer/PdfViewer';
import React, { useEffect, useState, useRef } from 'react';

const Mainpage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('about');
    const activeSectionRef = useRef<string>('about');
    const manualScrollRef = useRef<boolean>(false);
    const manualScrollTargetRef = useRef<string | null>(null);
    const manualScrollTimerRef = useRef<number | null>(null);
    const [sections, setSections] = useState<{ id: string; label: string }[]>([]);
    const [showPdfViewer, setShowPdfViewer] = useState<boolean>(false);

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
            const sectionHeading = (target.querySelector('.section-heading') as HTMLElement | null)
                || (target.querySelector('h2, h3, h1') as HTMLElement | null);
            const referenceEl = sectionHeading || target;

            // Wait a short moment so CSS variable and layout settle (fonts, resize observers)
            window.setTimeout(() => {
                // Use instant (auto) behavior on load so the browser doesn't animate from top-of-page to the hash position
                referenceEl.scrollIntoView({ behavior: 'auto', block: 'start' });

                // Final precise correction: align reference top with header top if header exists
                const header = document.querySelector('.header-name') as HTMLElement | null;
                if (header) {
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

        const sectionHeading = (target.querySelector('.section-heading') as HTMLElement | null)
            || (target.querySelector('h2, h3, h1') as HTMLElement | null);
        const referenceEl = sectionHeading || target;

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

        // Use scrollIntoView with scroll-margin-top (set by CSS variable) to align top edge with header
        (referenceEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
        const { pathname, search } = window.location;
        window.history.replaceState(null, '', `${pathname}${search}${href}`);
    };

    return (
        <div className="mainpage">
        <div className="left-side">
            <div className="sticky-wrapper">
                <header className="header-section">
                    <h1 className="header-name">
                        Jung Hwan Bae
                    </h1>
                    <h2 className="header-title">
                        Aspiring Software Engineer
                    </h2>
                    <p className="header-tagline">
                        I am an avid learner that loves problem solving :)
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
            <section id="about" aria-labelledby="about-heading">
                <h2 className="section-heading" id="about-heading">About</h2>
                <p className="about-intro">
                    Hi, thanks for stopping by! I go by Brandon.
                </p>
                <div className="about-content">
                    <p>
                        I studied at the University of Nevada, Las Vegas and earned a <strong>Bachelor of Science in Computer
                        Science</strong>. Since then, I’ve been fortunate to learn from talented teams across industry and academia.
                    </p>
                    <p>
                        At Credit One Bank, I served as a <strong>Full-Stack Developer Intern</strong>, building a React application and
                        contributing API endpoints that supported a modernized mobile experience. At UNLV’s Department of
                        Geoscience, I worked as a <strong>Student Web Developer</strong>, focusing on building accessible, standards-compliant
                        webpages and improving support for users of assistive technologies.
                    </p>
                    <p>
                        I later joined Raytheon as a <strong>Software Engineer</strong>, collaborating with an incredible team and growing my
                        skills through hands-on engineering work.
                    </p>
                    <p>
                        I’m a <strong>Software Engineer at Huntington Ingalls Industries</strong>, converted from a prior contract via Insight Global,
                        where I’m building performant, user-friendly web applications. I love solving hard problems, learning quickly,
                        and shipping polished, accessible experiences.
                    </p>
                </div>
            </section>
            <section id="experience" className="experience-section" aria-labelledby="experience-heading">
                <h2 className="section-heading" id="experience-heading">Experience</h2>
                <div className="experience-content">
                    <article className="job-item">
                        <h3 className="job-company">
                            Huntington Ingalls Industries
                        </h3>
                        <h4 className="job-title">
                            Software Engineer
                        </h4>
                        <p className="job-period">Jun 2025 - Present</p>
                        <ul className="job-description">
                            <li>Developed cutting-edge React based web application to satisfy customer requirements.</li>
                            <li>Assisted in deployment and testing of project from development to production environment.</li>
                            <li>Optimized JTT map to allow for significantly increased entity count without sacrificing quality.</li>
                        </ul>
                        <div className="job-skill-list">
                            <span className="job-skill">
                                Javascript
                            </span>
                            <span className="job-skill">
                                React
                            </span>
                            <span className="job-skill">
                                Docker
                            </span>
                            <span className="job-skill">
                                Cesium
                            </span>
                            <span className="job-skill">
                                CI/CD
                            </span>
                        </div>
                    </article>
                    <article className="job-item">
                        <h3 className="job-company">
                            Insight Global (Contracted to Huntington Ingalls Industries)
                        </h3>
                        <h4 className="job-title">
                            Software Engineer Consultant
                        </h4>
                        <p className="job-period">Sep 2024 - Jun 2025</p>
                        <p className="job-description-text">Contracted to HII on the same project prior to full-time conversion.</p>
                        <ul className="job-description">
                            <li>Developed cutting-edge React based web application to satisfy customer requirements.</li>
                            <li>Assisted in deployment and testing of project from development to production environment.</li>
                            <li>Optimized JTT map to allow for significantly increased entity count without sacrificing quality.</li>
                        </ul>
                        <div className="job-skill-list">
                            <span className="job-skill">
                                Javascript
                            </span>
                            <span className="job-skill">
                                React
                            </span>
                            <span className="job-skill">
                                Docker
                            </span>
                            <span className="job-skill">
                                Cesium
                            </span>
                            <span className="job-skill">
                                CI/CD
                            </span>
                        </div>
                    </article>
                    <article className="job-item">
                        <h3 className="job-company">
                            National Security Agency
                        </h3>
                        <h4 className="job-title">
                            Conditional Job Offer as Software Engineer
                        </h4>
                        <p className="job-period">Feb 2024 - Sep 2024</p>
                        <p className="job-description-text">
                            During this time period, I received a conditional job offer from the National Security Agency. However,
                            due to the lengthy investigation process, I elected to pursue employment elsewhere.
                        </p>
                    </article>
                    <article className="job-item">
                        <h3 className="job-company">
                            Raytheon
                        </h3>
                        <h4 className="job-title">
                            Software Engineer P1
                        </h4>
                        <p className="job-period">Oct 2023 - Feb 2024</p>
                        <ul className="job-description">
                            <li>Maintained and updated training material, documentation, and guides for commonly used department tools</li>
                            <li>Streamlined the onboarding process, significantly reducing assimilation time</li>
                            <li>Participated in technical review of various proprietary development applications</li>
                            <li>Contributed to the development of a model project showcasing departmental best practices for incorporating test executives into software and hardware</li>
                        </ul>
                        <div className="job-skill-list">
                            <span className="job-skill">
                                C#
                            </span>
                            <span className="job-skill">
                                ATEasy
                            </span>
                            <span className="job-skill">
                                Test Stand
                            </span>
                            <span className="job-skill">
                                Azure DevOps
                            </span>
                        </div>
                    </article>
                    <article className="job-item">
                        <h3 className="job-company">
                            UNLV, Dept. of Geoscience
                        </h3>
                        <h4 className="job-title">
                            Student Accessibility Web Developer
                        </h4>
                        <p className="job-period">Jan 2023 - Sep 2023</p>
                        <ul className="job-description">
                            <li>Ensured equal access to information and functionality across FIA and DATIM websites by addressing accessibility violations defined by WCAG and Section 508</li>
                            <li>Created contingency website for UNLV FIA, providing the group with a redundant copy of essential information and functions from the primary site</li>
                        </ul>
                        <div className="job-skill-list">
                            <span className="job-skill">
                                C#
                            </span>
                            <span className="job-skill">
                                JavaScript
                            </span>
                            <span className="job-skill">
                                JQuery
                            </span>
                            <span className="job-skill">
                                ASP.NET
                            </span>
                            <span className="job-skill">
                                HTML
                            </span>
                            <span className="job-skill">
                                CSS
                            </span>
                            <span className="job-skill">
                                Git
                            </span>
                        </div>
                    </article>
                    <article className="job-item">
                        <h3 className="job-company">
                            Credit One Bank
                        </h3>
                        <h4 className="job-title">
                            Full Stack Developer Intern
                        </h4>
                        <p className="job-period">Jun 2022 - Jan 2023</p>
                        <ul className="job-description">
                            <li>Developed a React-based web application that would allow any user to calculate the payoff timeline for a user-defined number of loans</li>
                            <li>Deployed various endpoints for a RESTful API that will be utilized in the company's modernized mobile website</li>
                        </ul>
                        <div className="job-skill-list">
                            <span className="job-skill">
                                Java
                            </span>
                            <span className="job-skill">
                                TypeScript
                            </span>
                            <span className="job-skill">
                                React.js
                            </span>
                            <span className="job-skill">
                                Spring
                            </span>
                            <span className="job-skill">
                                PostgreSQL
                            </span>
                            <span className="job-skill">
                                HTML
                            </span>
                            <span className="job-skill">
                                CSS
                            </span>
                            <span className="job-skill">    
                                Git
                            </span>
                        </div>
                    </article>
                    <div className="resume-cta">
                        <button className="resume-link" onClick={() => setShowPdfViewer(true)}>
                            View Full Resume →
                        </button>
                    </div>
                </div>
            </section>
            <section id="projects" className="projects-section" aria-labelledby="projects-heading">
                <h2 className="section-heading" id="projects-heading">Projects</h2>
                <RepoList items={[
                    {
                        name: "Design and Analysis Toolkit for Inventory and Monitoring (DATIM)",
                        description: "DATIM is a suite of software tools used for designing inventory and monitoring programs "
                        + "and analyzing the results of those programs.",
                        link: "https://apps.fs.usda.gov/DATIM/Default.aspx?",
                        skills: ["C#", "JavaScript", "JQuery", "ASP.NET", "HTML", "CSS", "Git"]
                    },
                    {
                        name: "Joint Training Tool",
                        description: "A government-owned, cloud-based, web-enabled, single digital environment accessible worldwide. "
                                        + "The tool supports collaborative planning and training for geographically separated commands "
                                        + "focused at the strategic and operational levels of war.",
                        link: "",
                        skills: ["Javascript", "React", "Docker", "Cesium", "CI/CD", "HTML", "CSS", "Git"]
                    }
                ]}/>
            </section>
        </div>
        {showPdfViewer && (
            <PdfViewer 
                url="https://personalsitefiles.blob.core.windows.net/professionalfiles/my-resume-2025.pdf"
                onClose={() => setShowPdfViewer(false)}
            />
        )}
        </div>
    );
};

export default Mainpage;