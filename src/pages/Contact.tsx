import '../App.css';
import { Attributions } from '../components/Attributions/Attributions';
import { ContactPage } from "../components/ContactPage/ContactPage"
import { NavBar } from "../components/NavBar/NavBar"

export const Contact = () => {
    return <div className="App">
        <NavBar items={["Home", "About", "Services", "Contact"]} />
        <ContactPage />
        <Attributions />
    </div>
}