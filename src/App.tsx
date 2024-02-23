import "./App.css";
import { Mainpage } from "./components/MainPage/Mainpage";
import { NavBar } from "./components/NavBar/NavBar";

function App() {
  return (
    <div className = "App">
      <NavBar items={["Home", "About", "Services", "Contact"]} />
      <Mainpage />
    </div>
  );
}

export default App;
