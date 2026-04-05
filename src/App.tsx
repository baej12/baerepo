import "./App.css";
import { lazy, Suspense, useEffect, useState } from "react";
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

const shouldAnimateRouteChange = (fromPath: string, toPath: string) => {
  if (fromPath === toPath) {
    return false;
  }

  return (
    (fromPath === "/" && toPath === "/history") ||
    (fromPath === "/history" && toPath === "/")
  );
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function AppRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [pendingLocation, setPendingLocation] = useState<typeof location | null>(null);
  const [transitionStage, setTransitionStage] = useState<"idle" | "exiting" | "entering">("idle");
  const isHistoryRoute = displayLocation.pathname === "/history";

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
    }, ENTER_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [transitionStage]);

  return (
    <main className={`App${isHistoryRoute ? " history-route" : ""}`}>
      <CustomCursor />
      {!isHistoryRoute && <SeasonalBackdrop />}
      <div
        className={`App-route-shell${transitionStage !== "idle" ? ` is-${transitionStage}` : ""}`}
        aria-live="polite"
      >
        <Suspense fallback={null}>
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
