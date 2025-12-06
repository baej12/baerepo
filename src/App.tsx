import "./App.css";
import Mainpage from "./components/MainPage/Mainpage";
import { CustomCursor } from "./components/CustomCursor/CustomCursor";
import { SeasonalBackdrop } from "./components/SeasonalBackdrop/SeasonalBackdrop";

function App() {
  return (
    <main className="App">
      <CustomCursor />
      <SeasonalBackdrop />
      <Mainpage />
    </main>
  );
}

export default App;
