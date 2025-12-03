import "./App.css";
import { Mainpage } from "./components/MainPage/Mainpage";
import { CustomCursor } from "./components/CustomCursor/CustomCursor";

function App() {
  return (
    <main className="App">
      <CustomCursor />
      <Mainpage />
    </main>
  );
}

export default App;
