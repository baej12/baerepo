import "./App.css";
import { Attributions } from "./components/Attributions/Attributions";
import { Mainpage } from "./components/MainPage/Mainpage";
import { NavBar } from "./components/NavBar/NavBar";

function App() {
  return (
    <div className = "App">
      <NavBar items={["Home", "About", "Services", "Contact"]} />
      <Mainpage />
      <Attributions />
    </div>
  );
}

export default App;
