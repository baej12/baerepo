import { useEffect, useState } from "react";
import { INavBarProps } from "../Interfaces/INavBarProps";
import navBarLogo from "../../assets/hey_reb_new.jpg";
import "./NavBar.css";
import { Link } from "react-router-dom";

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
        <img className="NavBar-Items-Item unselectable" src={navBarLogo} alt="UNLV Rebels Hey Reb mascot logo" onClick={()=>{redirect('https://unlv.edu')}} style={{ width: "4rem", height: "4rem" }}></img>
          {headerItems.map((item, index) => {
            return (
              <Link to={'/' + (item === 'Home' ? '' : item.toLowerCase())} key={item + index} className="NavBar-Items-Item unselectable">
                {item}
              </Link>
          )})}
      </div>
    </nav>
  );
};
