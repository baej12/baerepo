import { useEffect, useState } from 'react';
import './AboutPage.css';
import { redirect } from 'react-router-dom';
import cfbadge from '../../assets/cf-badge.png';
import mlbadge from '../../assets/ml-badge.png';

export const AboutPage = () => {
    const [date, setDate] = useState(new Date());
    
    useEffect(() => {
        setDate(new Date());
    }, [])

    return <div className='aboutpage' style={{minWidth:'50rem'}}>
        <div className='innerborder' style={{minWidth: '40rem'}}>
            <h1 className='unselectable' style={{color:'orange'}}>About Me</h1>
            <h2>Summary</h2>
            <p className='textblock'>
                Hi everybody! My name is Brandon and I have a passion for learning. I fell in love with computer science and programming 
                because everything felt like a puzzle. I love puzzles. I love solving them. I love creating them. I love the challenge.
                I currently have almost 2 years of professional experience in the field of computer science. I have worked with a variety of
                jobs including web and software development.
                I graduated from the University of Nevada, Las Vegas with a Bachelor's of Science in Computer Science. As of&nbsp;
                {date.getMonth() + 1}/{date.getDate().toString()}/{date.getFullYear().toString()}, <b style={{color:'red'}}>I am actively seeking
                employment opportunities.</b>
            </p>
            <h2>Experience</h2>
            <p className='textblock'>
                <table>
                    <p className='textblock'>
                        <h3>
                            Raytheon Technologies
                        </h3>
                        <h4>Software Engineer</h4>
                        - Provide internal and external engineering teams with support for miscellaneous system functions<br/><br/>
                        - Developed training material and onboarding guides that decreased new hire assimilation time<br/><br/>
                        - Managed proprietary image recognition project, integrating software and hardware testing<br/><br/>
                        - Participated in reviewing a new employee management software, enabling managers to track teams,
                        identify deficiencies, and facilitate internal transfers through enhanced communication features<br/><br/>
                    </p>
                    <p className='textblock'>
                        <h3>
                            UNLV FIA, Dept. of Geoscience
                        </h3>
                        <h4>Accessibility Developer</h4>
                        - Facilitated equal access to information and functionality via Section 508 and WCAG<br/><br/>
                        - Remedied hundreds of different accessibility violations that impaired assistive technology<br/><br/>
                        - Contributed to the development of a contingency website for UNLV FIA, providing a redundant
                        copy of essential information from the primary site<br/><br/>
                    </p>
                    <p className='textblock'>
                        <h3>
                            Credit One Bank
                        </h3>
                        <h4>Backend Developer Intern II</h4>
                        - Architect, administrate, and deploy APIs crucial for the front-end development team<br/><br/>
                        - Identified optimizations and patches to reduce compile time and alleviate performance burdens in
                        developing the new API that powers the upgraded mobile version of the desktop site<br/><br/>
                        <h4>Fullstack Developer Intern I</h4>
                        - Revamp user interface components through a comprehensive analysis of the existing system<br/><br/>
                        - Provided input and enacted modifications for the company's recently introduced internship initiative,
                        influencing enhancements for upcoming programs<br/><br/>
                    </p>
                </table>
            </p>
            <h2>Education and Certifications</h2>
            <p className='textblock'>
                <p className='textblock'>
                    <h3>University of Nevada, Las Vegas</h3>
                    <a href='https://www.unlv.edu/degree/bs-computer-science'><h4>Bachelor's of Science in Computer Science</h4></a> 
                    August 2023
                </p>
                <p className='textblock'>
                    <h3>AWS Academy Certifications</h3>
                    <div className='certrow'>
                        <img src={cfbadge} alt="Certification Badge" style={{width:'100px', height:'100px'}}></img>
                        <a href='https://www.credly.com/badges/0584e437-8be0-4f39-acf4-ff0830cc995f'>Cloud Foundations</a>
                    </div>
                    <div className='certrow'>
                        <img src={mlbadge} alt="Certification Badge" style={{width:'100px', height:'100px'}} onClick={()=>{redirect('https://www.credly.com/badges/be28c4a6-d979-4014-98e6-e72a3ea95d1e')}}></img>
                        <a href='https://www.credly.com/badges/be28c4a6-d979-4014-98e6-e72a3ea95d1e'>Machine Learning Foundations</a>
                    </div>
                </p>
            </p>
            <h2>Skills</h2>
            <p className='textblock'>
                <p className='textblock'>
                    <h3>Programming Languages</h3>
                    <ul>
                        <li>C/C++</li>
                        <li>C#</li>
                        <li>Python</li>
                        <li>Java</li>
                        <li>JavaScript</li>
                        <li>Typescript</li>
                        <li>Python</li>
                        <li>MATLAB</li>
                    </ul>
                </p>
                <p className='textblock'>
                    <h3>Web Development</h3>
                    <ul>
                        <li>React</li>
                        <li>Node.js</li>
                        <li>JQuery</li>
                        <li>Next.js</li>
                        <li>ASP.NET</li>
                        <li>HTML/CSS</li>
                    </ul>                    
                </p>
                <p className='textblock'>
                    <h3>Database and Data Management</h3>
                    <ul>
                        <li>PostgreSQL</li>
                        <li>MongoDB</li>
                        <li>MySQL</li>
                    </ul>
                </p>
                <p className='textblock'>
                    <h3>Testing and Quality Assurance</h3>
                    <ul>
                        <li>JUnit</li>
                        <li>Mockito</li>
                        <li>Test Stand</li>
                        <li>ATEasy</li>
                    </ul>
                </p>
                <p className='textblock'>
                    <h3>DevOps and Infrastructure</h3>
                    <ul>
                        <li>Docker</li>
                        <li>Kubernetes</li>
                        <li>Amazon Web Services</li>
                        <li>CI/CD</li>
                        <li>Git</li>
                        <li>Spring</li>
                        <li>Kafka</li>
                        <li>Maven</li>
                        <li>RESTful API</li>
                        <li>Azure DevOps</li>
                        <li>Ant</li>
                    </ul>
                </p>

            </p>
        </div>
    </div>
}