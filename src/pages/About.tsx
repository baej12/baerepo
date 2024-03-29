import '../App.css';
import { AboutPage } from '../components/AboutPage/AboutPage';
import { Attributions } from '../components/Attributions/Attributions';
import { NavBar } from '../components/NavBar/NavBar';

export const About = () => {
  return (
    <div className="App" style={{height:'100%'}}>
      <NavBar items={["Home", "About", "Services", "Contact"]} />
      <AboutPage />
      <Attributions />
    </div>
  );
}