import { useState, useEffect } from 'react';
import homeIcon from '../../assets/icons8-home-50.png';
import aboutIcon from '../../assets/icons8-about-32.png';
import contactIcon from '../../assets/icons8-contact-32.png';
import serviceIcon from '../../assets/icons8-services-24.png';
import './Sidebar.css'; // Import your stylesheet

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let links : HTMLCollectionOf<Element>= document.getElementsByClassName('sidebar-link');
    if (links) {
        if (collapsed) {
            for (let i = 0; i < links.length; ++i) {
                let element : HTMLElement | null = document.getElementById(links[i].id);
                if (element) {
                    element.hidden = true;
                    let homeElement : HTMLElement | null = document.getElementById('sidebar-home-image');
                    let aboutElement : HTMLElement | null = document.getElementById('sidebar-about-image');
                    let contactElement : HTMLElement | null = document.getElementById('sidebar-contact-image');
                    let serviceElement : HTMLElement | null = document.getElementById('sidebar-services-image');
                    let mainPage : HTMLElement | null = document.getElementById('mainpage');
                    if (homeElement) {
                        homeElement.hidden = false;
                    }
                    if (aboutElement) {
                        aboutElement.hidden = false;
                    }
                    if (contactElement) {
                        contactElement.hidden = false;
                    }
                    if (serviceElement) {
                        serviceElement.hidden = false;
                    }
                    if (mainPage) {
                        mainPage.style.left =  "6.5rem";
                        mainPage.style.width = "89.5vh";
                    }
                }
            }
        } else {
            for (let i = 0; i < links.length; ++i) {
                let element : HTMLElement | null = document.getElementById(links[i].id);
                if (element) {
                    element.hidden = false;
                    let homeElement : HTMLElement | null = document.getElementById('sidebar-home-image');
                    let aboutElement : HTMLElement | null = document.getElementById('sidebar-about-image');
                    let contactElement : HTMLElement | null = document.getElementById('sidebar-contact-image');
                    let serviceElement : HTMLElement | null = document.getElementById('sidebar-services-image');
                    let mainPage : HTMLElement | null = document.getElementById('mainpage');
                    if (homeElement) {
                        homeElement.hidden = true;
                    }
                    if (aboutElement) {
                        aboutElement.hidden = true;
                    }
                    if (contactElement) {
                        contactElement.hidden = true;
                    }
                    if (serviceElement) {
                        serviceElement.hidden = true;
                    }
                    if (mainPage) {
                        mainPage.style.left =  "18rem";
                        mainPage.style.width = "calc(~\"89.5vh - 12.5rem\") !important";
                    }
                }
            }
        }
    }
  }, [collapsed])

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="toggle-button" onClick={toggleSidebar}>
        {collapsed ? '>' : '<'}
      </div>
      <ul className="nav-links">
        <li hidden={false} id = "sidebar-home" className="sidebar-link">Home</li>
        <img hidden={true} src={homeIcon} alt="home" className="sidebar-icon" id="sidebar-home-image" height={32} width={32}></img>
        <li hidden={false} id = "sidebar-about" className="sidebar-link">About</li>
        <img hidden={true} src={aboutIcon} alt="about" className="sidebar-icon" id="sidebar-about-image" height={32} width={32}></img>
        <li hidden={false} id = "sidebar-services" className="sidebar-link">Services</li>
        <img hidden={true} src={serviceIcon} alt="services" className="sidebar-icon" id="sidebar-services-image" height={32} width={32}></img>
        <li hidden={false} id = "sidebar-contact" className="sidebar-link">Contact</li>
        <img hidden={true} src={contactIcon} alt="contact" className="sidebar-icon" id="sidebar-contact-image" height={32} width={32}></img>
      </ul>
    </div>
  );
};

export default Sidebar;
