import { ReactElement, useEffect, useState } from 'react';
import './Mainpage.css';
import Sidebar from '../Sidebar/Sidebar';
import axios, { AxiosResponse } from 'axios';
import { RepoList } from '../RepoList/RepoList';

export const Mainpage = () => {
    // const [date, setDate] = useState(new Date());

    // useEffect(() => {
    //     setDate(new Date());
    // }, [])

    // return <div className="mainpage" id="mainpage">
    //     <div style={{border:"2px solid grey", borderRadius:"1rem", margin:"2rem", padding:"2rem", minWidth:'35rem'}}>
    //         <h1 className="unselectable" style={{color:"orange"}}>
    //             Welcome to Brandon's Repository!
    //         </h1>   
    //         <h2 className="unselectable alert">
    //             This website is still undergoing maintenance as of 
    //             {date.getMonth() + 1}/{date.getDate().toString()}/{date.getFullYear().toString()}. 
    //             Many features have been disabled. <br />
    //             Please check back later.
    //         </h2>
    //         <p className='textblock'>
    //             This website will host a variety of projects and information about me. 
    //             I used React and Typescript to construct this website.
    //             Currently, the website is under construction and will be updated as time goes on.
    //             Some pages or features will be disabled to prevent potential spam and abuse.
    //         </p>  
    //     </div>
    // </div>

    const [repo, setRepo] = useState([]);

    async function getGitRepoList() : Promise<void> {
        try {
            // let response : AxiosResponse<any> = await axios.get("https://api.github.com/users/baej12/repos");
            let response : any;
            setRepo(response.data);
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    const displayRepoList = () : ReactElement<any, any> => {

        return <div>
            {repo.map((r) => {return <div>{}</div>})}
        </div>
    }

    useEffect(() => {
        getGitRepoList();
    }, []);

    return <div className = "mainpage">
        <div className = "left-side">
            <span className = "header-item" style={{fontSize : '3rem', fontWeight: '700'}}>
                Jung Hwan Bae
            </span>
            <br/>
            <span className = "header-item" style={{fontSize: '1.75rem', paddingTop: '0.5rem'}}>
                Aspiring Software Engineer
            </span>
            <span className = "header-item" style={{paddingTop: '1.25rem', color: 'rgb(200,200,200)'}}>
                I am an avid learner that loves problem solving :)
            </span>

            <ul className = "nav-items">
                <li><a className="page-navigator" href="#about">About</a></li>
                <li><a className="page-navigator" href="#experience">Experience</a></li>
                <li><a className="page-navigator" href="#projects">Projects</a></li>
            </ul>
        </div>
        <div className = "right-side">
            <section id = "about">
                <span className="right-side-item text-item" style={{display:'inline'}}>
                    Since I was a kid, I have been fascinated with computers and technology. I was always
                    tinkering with the family computer and trying out new things I would see on forums.
                    When I eventually saved up enough to build my own PC, I was able to delve further into
                    the internet. Since then, I've discovered my <b>passion for programming</b> and have continued
                    to pursue this career path. 
                </span>
                <span className="right-side-item text-item" style={{paddingTop: '2rem', display:'inline'}}>
                    In 2019, I enrolled at the University of Nevada - Las Vegas. I pursued a <b>Bachelor of Science
                    in Computer Science.</b> During my academic career, I had the privilege of interning at Credit One
                    Bank as a <b>Full Stack Developer Intern</b>. My time there was a great learning experience and allowed
                    me to peer into what my professional career will look like. In addition, I also worked as a student
                    worker at the UNLV's Department of Geoscience as a <b>Student Web Developer.</b> During my time there, I
                    was able to educate myself on creating webpages that were accessibility to those using assistive
                    technologies. After graduating UNLV, I accepted a position at Raytheon as a <b>Software Engineer.</b>&nbsp;
                    During my time there, I was able to work with an incredibly smart team that I was able to learn a lot
                    from. Sadly, due to business reorganizations, my position was let go and I was laid off. I am 
                    currently open to any opportunities that are presented. Feel free to contact me with any offers.
                </span>
                <span className="right-side-item text-item" style={{paddingTop: '2rem'}}>
                    When I'm not grinding LeetCode or attempting CTF events, you'll usually find me 
                    toiling away in Factorio or MineCraft. The factory must grow! The crops must be harvested!
                </span>
            </section>
            <section id = "experience" style={{paddingTop: '10rem'}}>
                <span className="right-side-item text-item" style={{marginBottom:'10rem'}}>
                    <div className="job-item">
                        <h1>
                            National Security Agency
                        </h1>
                        <h3>
                            Software Engineer
                        </h3>
                        <strong>Apr 2024 - Current</strong><br/><br/>
                        <span>I am currently waiting for their background investigation to clear me to start at the NSA.</span>
                    </div>
                    <div className="job-item">
                        <h1>
                            Raytheon
                        </h1>
                        <h3>
                            Software Engineer
                        </h3>
                        <strong>Oct 2023 - Feb 2024</strong><br/><br/>
                        - Maintained and updated training material, documentation, and guides for commonly
                            used department tools<br/>
                        - Streamlined the onboarding process, significantly reducing assimilation time <br/>
                        - Participated in technical review of various proprietary development applications <br/>
                        - Contributed to the development of a model project showcasing departmental best
                            practices for incorporating test executives into software and hardware <br/>
                        <div className="job-skill-list">
                            <span className="job-skill">
                                C#
                            </span>
                            <span className="job-skill">
                                ATEasy
                            </span>
                            <span className="job-skill">
                                Test Stand
                            </span>
                            <span className="job-skill">
                                Azure DevOps
                            </span>
                        </div>
                    </div>
                    <div className="job-item">
                        <h1>
                            UNLV, Dept. of Geoscience
                        </h1>
                        <h3>
                            Student Web Developer
                        </h3>
                        <strong>Jan 2023 - Sep 2023</strong><br/><br/>
                        - Ensured equal access to information and functionality across FIA and DATIM
                            websites by addressing accessibility violations defined by WCAG and Section 508<br/>
                        - Created contingency website for UNLV FIA, providing the group with a redundant
                            copy of essential information and functions from the primary site<br/>
                        <div className="job-skill-list">
                            <span className="job-skill">
                                C#
                            </span>
                            <span className="job-skill">
                                JavaScript
                            </span>
                            <span className="job-skill">
                                JQuery
                            </span>
                            <span className="job-skill">
                                ASP.NET
                            </span>
                            <span className="job-skill">
                                HTML
                            </span>
                            <span className="job-skill">
                                CSS
                            </span>
                            <span className="job-skill">
                                Git
                            </span>
                        </div>
                    </div>
                    <div className="job-item">
                        <h1>
                            Credit One Bank
                        </h1>
                        <h3>
                            Full Stack Developer Intern
                        </h3>
                        <strong>Jun 2022 - Jan 2023</strong><br/><br/>
                        - Developed a React-based web application that would allow any user to calculate the
                            payoff timeline for a user-defined number of loans<br/>
                        - Deployed various endpoints for a RESTful API that will be utilized in the
                            company’s modernized mobile website<br/>
                        <div className="job-skill-list">
                            <span className="job-skill">
                                Java
                            </span>
                            <span className="job-skill">
                                TypeScript
                            </span>
                            <span className="job-skill">
                                React.js
                            </span>
                            <span className="job-skill">
                                Spring
                            </span>
                            <span className="job-skill">
                                PostgreSQL
                            </span>
                            <span className="job-skill">
                                HTML
                            </span>
                            <span className="job-skill">
                                CSS
                            </span>
                            <span className="job-skill">    
                                Git
                            </span>
                        </div>
                    </div>
                    <h1>
                        <a className="resume-link" href="https://github.com/baej12/baerepo/blob/8b15429559edcf31df13ffca1dc4706e4e0245aa/my-resume.pdf">
                            Click here to view full resume
                        </a>
                    </h1>
                </span>
            </section>
            <section id = "projects">
                <RepoList/>
            </section>
        </div>
    </div>
}