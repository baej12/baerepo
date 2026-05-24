import "./App.css";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CustomCursor } from "./components/CustomCursor/CustomCursor";
import { SeasonalBackdrop } from "./components/SeasonalBackdrop/SeasonalBackdrop";

const Mainpage = lazy(() => import("./components/MainPage/Mainpage"));
const About = lazy(() => import("./pages/About").then(module => ({ default: module.About })));
const Services = lazy(() => import("./pages/Services").then(module => ({ default: module.Services })));
const Contact = lazy(() => import("./pages/Contact").then(module => ({ default: module.Contact })));
const History = lazy(() => import("./pages/History").then(module => ({ default: module.History })));

const EXIT_TRANSITION_MS = 160;
const ENTER_TRANSITION_MS = 260;
const LOADER_EXIT_MS = 220;

const shouldAnimateRouteChange = (fromPath: string, toPath: string) => {
  if (fromPath === toPath) {
    return false;
  }

  return false;
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
  const loaderTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const routeShellRef = useRef<HTMLDivElement | null>(null);
  const isHistoryRoute = displayLocation.pathname === "/history";

  const resetRouteScroll = () => {
    routeShellRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (isRouteLoading && transitionStage === "idle") {
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
  }, [isRouteLoading, showRouteLoading, transitionStage]);

  useEffect(() => {
    if (transitionStage !== "idle") {
      setShowRouteLoading(true);
      setIsRouteLoadingExiting(false);
    }
  }, [transitionStage]);

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
      setPendingLocation(null);
      resetRouteScroll();
      setDisplayLocation(location);
      setTransitionStage("idle");
      return;
    }

    setPendingLocation(location);
    setTransitionStage("exiting");
  }, [displayLocation.key, displayLocation.pathname, location]);

  useEffect(() => {
    if (transitionStage !== "exiting" || !pendingLocation) {
      return;
    }

    const timer = window.setTimeout(() => {
      resetRouteScroll();
      setDisplayLocation(pendingLocation);
      setPendingLocation(null);
      setTransitionStage("entering");
    }, EXIT_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [pendingLocation, transitionStage]);

  useEffect(() => {
    if (transitionStage !== "entering") {
      return;
    }

    const timer = window.setTimeout(() => {
      setTransitionStage("idle");
      // Start loader exit animation
      setIsRouteLoadingExiting(true);
      loaderTimeoutRef.current = setTimeout(() => {
        setShowRouteLoading(false);
        setIsRouteLoadingExiting(false);
      }, LOADER_EXIT_MS);
    }, ENTER_TRANSITION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [transitionStage]);

  return (
    <main className={`App${isHistoryRoute ? " history-route" : ""}`}>
      <CustomCursor />
      {!isHistoryRoute && <SeasonalBackdrop />}
      <div
        ref={routeShellRef}
        className={`App-route-shell${transitionStage !== "idle" ? ` is-${transitionStage}` : ""}${showRouteLoading ? " is-route-loading" : ""}`}
        aria-live="polite"
      >
        {showRouteLoading && <RouteLoadingOverlay isExiting={isRouteLoadingExiting} />}
        <Suspense fallback={<RouteLoadingFallback setIsRouteLoading={setIsRouteLoading} />}>
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
