import { useEffect, useState } from 'react';
import './Mainpage.css';

export const Mainpage = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        setDate(new Date());
    }, [])

    return <div className="mainpage" id="mainpage">
        <div style={{border:"2px solid grey", borderRadius:"1rem", margin:"2rem", padding:"2rem", minWidth:'35rem'}}>
            <h1 className="unselectable" style={{color:"orange"}}>
                Welcome to Brandon's Repository!
            </h1>
            <h2 className="unselectable alert">
                This website is still undergoing maintenance as of {date.getMonth() + 1}/{date.getDate().toString()}/{date.getFullYear().toString()}. 
                Many features have been disabled. <br />
                Please check back later.
            </h2>
            <p className='textblock'>
                This website will host a variety of projects and information about me. 
                I used React and Typescript to construct this website.
                Currently, the website is under construction and will be updated as time goes on.
                Some pages or features will be disabled to prevent potential spam and abuse.
            </p>
        </div>
    </div>
}