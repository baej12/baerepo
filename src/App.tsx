import "./App.css";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CustomCursor } from "./components/CustomCursor/CustomCursor";
import { SeasonalBackdrop } from "./components/SeasonalBackdrop/SeasonalBackdrop";

const loadMainpage = () => import("./components/MainPage/Mainpage");
const loadHistory = () => import("./pages/History").then(module => ({ default: module.History }));

const Mainpage = lazy(loadMainpage);
const About = lazy(() => import("./pages/About").then(module => ({ default: module.About })));
const Services = lazy(() => import("./pages/Services").then(module => ({ default: module.Services })));
const Contact = lazy(() => import("./pages/Contact").then(module => ({ default: module.Contact })));
const History = lazy(loadHistory);

const EXIT_TRANSITION_MS = 160;
const ENTER_TRANSITION_MS = 260;
const LOADER_EXIT_MS = 220;

const shouldAnimateRouteChange = (fromPath: string, toPath: string) => {
  if (fromPath === toPath) {
    return false;
  }

  return (
    (fromPath === "/history" && toPath === "/") ||
    (fromPath === "/" && toPath === "/history")
  );
};

const preloadAnimatedRoute = (path: string) => {
  if (path === "/") return loadMainpage();
  if (path === "/history") return loadHistory();
  return Promise.resolve();
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const RouteLoadingSignal = ({ setIsRouteLoading }: { setIsRouteLoading: (value: boolean) => void }) => {
  useEffect(() => {
    setIsRouteLoading(true);
    return () => setIsRouteLoading(false);
  }, [setIsRouteLoading]);

  return null;
};

const RouteLoadingOverlay = ({ isExiting }: { isExiting: boolean }) => (
  <div className={`route-loading${isExiting ? " is-exiting" : ""}`}>
    <div className="route-loading-stack">
      <div className="route-loading-ring"></div>
      <p className="route-loading-text">Loading experience...</p>
    </div>
  </div>
);

const RouteLoadingFallback = ({ setIsRouteLoading }: { setIsRouteLoading: (value: boolean) => void }) => (
  <>
    <RouteLoadingSignal setIsRouteLoading={setIsRouteLoading} />
    <RouteLoadingOverlay isExiting={false} />
  </>
);

function AppRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [pendingLocation, setPendingLocation] = useState<typeof location | null>(null);
  const [transitionStage, setTransitionStage] = useState<"idle" | "exiting" | "entering">("idle");
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [showRouteLoading, setShowRouteLoading] = useState(false);
  const [isRouteLoadingExiting, setIsRouteLoadingExiting] = useState(false);
  const [isAnimatedRoutePending, setIsAnimatedRoutePending] = useState(false);
  const loaderTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const routeShellRef = useRef<HTMLDivElement | null>(null);
  const isHistoryRoute = displayLocation.pathname === "/history";

  const resetRouteScroll = () => {
    routeShellRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (isRouteLoading && transitionStage === "idle" && !isAnimatedRoutePending) {
      setShowRouteLoading(true);
      setIsRouteLoadingExiting(false);
      if (loaderTimeoutRef.current) clearTimeout(loaderTimeoutRef.current);
    } else if (!isRouteLoading && showRouteLoading && transitionStage === "idle") {
      setIsRouteLoadingExiting(true);
      loaderTimeoutRef.current = setTimeout(() => {
        setShowRouteLoading(false);
        setIsRouteLoadingExiting(false);
      }, LOADER_EXIT_MS);
    }

    return () => {
      if (loaderTimeoutRef.current) clearTimeout(loaderTimeoutRef.current);
    };
  }, [isAnimatedRoutePending, isRouteLoading, showRouteLoading, transitionStage]);

  useEffect(() => {
    if (
      location.pathname === displayLocation.pathname &&
      location.key === displayLocation.key
    ) {
      return;
    }

    if (
      prefersReducedMotion() ||
      !shouldAnimateRouteChange(displayLocation.pathname, location.pathname)
    ) {
      setIsAnimatedRoutePending(false);
      setPendingLocation(null);
      resetRouteScroll();
      setDisplayLocation(location);
      setTransitionStage("idle");
      return;
    }

    let isCanceled = false;
    setIsAnimatedRoutePending(true);
    setShowRouteLoading(false);
    setIsRouteLoadingExiting(false);

    preloadAnimatedRoute(location.pathname)
      .catch(() => {})
      .finally(() => {
        if (isCanceled) return;
        setPendingLocation(location);
        setTransitionStage("exiting");
      });

    return () => {
      isCanceled = true;
    };
  }, [displayLocation.key, displayLocation.pathname, location]);

  useEffect(() => {
    if (transitionStage !== "exiting" || !pendingLocation) {
      return;
    }

    const timer = window.setTimeout(() => {
      resetRouteScroll();
      setDisplayLocation(pendingLocation);
      setPendingLocation(null);
      window.requestAnimationFrame(() => {
        setTransitionStage("entering");
      });
    }, EXIT_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [pendingLocation, transitionStage]);

  useEffect(() => {
    if (transitionStage !== "entering") {
      return;
    }

    const timer = window.setTimeout(() => {
      setTransitionStage("idle");
      if (showRouteLoading) {
        setIsRouteLoadingExiting(true);
        loaderTimeoutRef.current = setTimeout(() => {
          setShowRouteLoading(false);
          setIsRouteLoadingExiting(false);
        }, LOADER_EXIT_MS);
      }
      setIsAnimatedRoutePending(false);
    }, ENTER_TRANSITION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showRouteLoading, transitionStage]);

  return (
    <main className={`App${isHistoryRoute ? " history-route" : ""}`}>
      <CustomCursor />
      {!isHistoryRoute && <SeasonalBackdrop />}
      {transitionStage !== "idle" && (
        <div className={`route-transition-veil is-${transitionStage}`} aria-hidden="true" />
      )}
      <div
        ref={routeShellRef}
        className={`App-route-shell${transitionStage !== "idle" ? ` is-${transitionStage}` : ""}${showRouteLoading && transitionStage === "idle" ? " is-route-loading" : ""}`}
        aria-live="polite"
      >
        {showRouteLoading && transitionStage === "idle" && <RouteLoadingOverlay isExiting={isRouteLoadingExiting} />}
        <Suspense fallback={transitionStage === "idle" && !isAnimatedRoutePending ? <RouteLoadingFallback setIsRouteLoading={setIsRouteLoading} /> : null}>
          <Routes location={displayLocation}>
            <Route path="/" element={<Mainpage />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/history" element={<History />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
