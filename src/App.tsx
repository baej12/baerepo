import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Mainpage from "./components/MainPage/Mainpage";
import { CustomCursor } from "./components/CustomCursor/CustomCursor";
import { SeasonalBackdrop } from "./components/SeasonalBackdrop/SeasonalBackdrop";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { Contact } from "./pages/Contact";
import { History } from "./pages/History";

function AppRoutes() {
  const location = useLocation();
  const isHistoryRoute = location.pathname === "/history";

  return (
    <main className={`App${isHistoryRoute ? " history-route" : ""}`}>
      <CustomCursor />
      {!isHistoryRoute && <SeasonalBackdrop />}
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/history" element={<History />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
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
