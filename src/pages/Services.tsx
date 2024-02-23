import '../App.css';
import { NavBar } from "../components/NavBar/NavBar"
import { ServicesPage } from "../components/ServicesPage/ServicesPage"

export const Services = () => {
    return <div className='App'>
        <NavBar items={["Home", "About", "Services", "Contact"]} />
        <ServicesPage/>
    </div>
}