import { useEffect, useState } from "react";
import { INavBarProps } from "../Interfaces/INavBarProps";
import navBarLogo from "../../assets/hey_reb_new.jpg";
import "./NavBar.css";
import { NavLink } from "react-router-dom";

export const NavBar = (props: INavBarProps) => {
  const [headerItems, setHeaderItems] = useState<Array<string>>([]);

  useEffect(() => {
    setHeaderItems(props.items);
  }, [props.items]);

  const redirect = (item: string) : any => {
    window.open(item, "_blank");
  };

  return (
    <nav className="NavBar-Parent">
      <div className="NavBar-Items">
        <button className="NavBar-LogoButton" onClick={() => { redirect('https://unlv.edu'); }} aria-label="Open UNLV website">
          <img className="NavBar-Logo unselectable" src={navBarLogo} alt="UNLV Rebels Hey Reb mascot logo" />
        </button>
          {headerItems.map((item, index) => {
            const to = '/' + (item === 'Home' ? '' : item.toLowerCase());
            return (
              <NavLink
                to={to}
                key={item + index}
                className={({ isActive }) => `NavBar-Items-Item unselectable${isActive ? ' is-active' : ''}`}
                end={item === 'Home'}
              >
                {item}
              </NavLink>
          )})}
      </div>
    </nav>
  );
};
