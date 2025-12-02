import './Mainpage.css';
import { RepoList } from '../RepoList/RepoList';
// import liicon from '../../assets/linkedinwhite.png';
// import githubicon from '../../assets/githubwhite.png';
// import { useEffect } from 'react';

export const Mainpage = () => {
    return <div className="mainpage">
        <div className="left-side">
            <div className="sticky-wrapper">
                <header className="header-section">
                    <h1 className="header-name">
                        Jung Hwan Bae
                    </h1>
                    <h2 className="header-title">
                        Aspiring Software Engineer
                    </h2>
                    <p className="header-tagline">
                        I am an avid learner that loves problem solving :)
                    </p>
                </header>

                <nav className="nav-items" aria-label="Page navigation">
                    <ul>
                        <li><a className="page-navigator" href="#about">About</a></li>
                        <li><a className="page-navigator" href="#experience">Experience</a></li>
                        <li><a className="page-navigator" href="#projects">Public Projects</a></li>
                    </ul>
                </nav>

                {/* <span style ={{position: "sticky", marginTop: "50vh"}}>
                    <a href="https://www.linkedin.com/in/jhbbae/">
                        <img src={liicon} width="42" height="42" style={{marginRight:'2rem'}} 
                            alt = "go to linkedin profile"
                            className = "soc-link"
                        />
                    </a>
                    <a href="https://github.com/baej12">
                        <img src={githubicon} width="42" height="42" style={{}}
                            alt = "go to github profile"
                            className = "soc-link"
                        />
                    </a>
                </span> */}
            </div>
        </div>
        <div className="right-side">
            <section id="about" aria-labelledby="about-heading">
                <h2 className="section-heading" id="about-heading">About</h2>
                <p className="about-intro">
                    Hi, thanks for stopping by! I go by Brandon.
                </p>
                <div className="about-content">
                    <p>
                        I studied at the University of Nevada, Las Vegas and earned a <strong>Bachelor of Science in Computer
                        Science</strong>. Since then, I’ve been fortunate to learn from talented teams across industry and academia.
                    </p>
                    <p>
                        At Credit One Bank, I served as a <strong>Full-Stack Developer Intern</strong>, building a React application and
                        contributing API endpoints that supported a modernized mobile experience. At UNLV’s Department of
                        Geoscience, I worked as a <strong>Student Web Developer</strong>, focusing on building accessible, standards-compliant
                        webpages and improving support for users of assistive technologies.
                    </p>
                    <p>
                        I later joined Raytheon as a <strong>Software Engineer</strong>, collaborating with an incredible team and growing my
                        skills through hands-on engineering work.
                    </p>
                    <p>
                        I’m a <strong>Software Engineer at Huntington Ingalls Industries</strong>, converted from a prior contract via Insight Global,
                        where I’m building performant, user-friendly web applications. I love solving hard problems, learning quickly,
                        and shipping polished, accessible experiences.
                    </p>
                </div>
            </section>
            <section id="experience" className="experience-section" aria-labelledby="experience-heading">
                <h2 className="section-heading" id="experience-heading">Experience</h2>
                <div className="experience-content">
                    <article className="job-item">
                        <h3 className="job-company">
                            Huntington Ingalls Industries
                        </h3>
                        <h4 className="job-title">
                            Software Engineer
                        </h4>
                        <p className="job-period">Jun 2025 - Present</p>
                        <ul className="job-description">
                            <li>Developed cutting-edge React based web application to satisfy customer requirements.</li>
                            <li>Assisted in deployment and testing of project from development to production environment.</li>
                            <li>Optimized JTT map to allow for significantly increased entity count without sacrificing quality.</li>
                        </ul>
                        <div className="job-skill-list">
                            <span className="job-skill">
                                Javascript
                            </span>
                            <span className="job-skill">
                                React
                            </span>
                            <span className="job-skill">
                                Docker
                            </span>
                            <span className="job-skill">
                                Cesium
                            </span>
                            <span className="job-skill">
                                CI/CD
                            </span>
                        </div>
                    </article>
                    <article className="job-item">
                        <h3 className="job-company">
                            Insight Global (Contracted to Huntington Ingalls Industries)
                        </h3>
                        <h4 className="job-title">
                            Software Engineer Consultant
                        </h4>
                        <p className="job-period">Sep 2024 - Jun 2025</p>
                        <p className="job-description-text">Contracted to HII on the same project prior to full-time conversion.</p>
                        <ul className="job-description">
                            <li>Developed cutting-edge React based web application to satisfy customer requirements.</li>
                            <li>Assisted in deployment and testing of project from development to production environment.</li>
                            <li>Optimized JTT map to allow for significantly increased entity count without sacrificing quality.</li>
                        </ul>
                        <div className="job-skill-list">
                            <span className="job-skill">
                                Javascript
                            </span>
                            <span className="job-skill">
                                React
                            </span>
                            <span className="job-skill">
                                Docker
                            </span>
                            <span className="job-skill">
                                Cesium
                            </span>
                            <span className="job-skill">
                                CI/CD
                            </span>
                        </div>
                    </article>
                    <article className="job-item">
                        <h3 className="job-company">
                            National Security Agency
                        </h3>
                        <h4 className="job-title">
                            Conditional Job Offer as Software Engineer
                        </h4>
                        <p className="job-period">Feb 2024 - Sep 2024</p>
                        <p className="job-description-text">
                            During this time period, I received a conditional job offer from the National Security Agency. However,
                            due to the lengthy investigation process, I elected to pursue employment elsewhere.
                        </p>
                    </article>
                    <article className="job-item">
                        <h3 className="job-company">
                            Raytheon
                        </h3>
                        <h4 className="job-title">
                            Software Engineer P1
                        </h4>
                        <p className="job-period">Oct 2023 - Feb 2024</p>
                        <ul className="job-description">
                            <li>Maintained and updated training material, documentation, and guides for commonly used department tools</li>
                            <li>Streamlined the onboarding process, significantly reducing assimilation time</li>
                            <li>Participated in technical review of various proprietary development applications</li>
                            <li>Contributed to the development of a model project showcasing departmental best practices for incorporating test executives into software and hardware</li>
                        </ul>
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
                    </article>
                    <article className="job-item">
                        <h3 className="job-company">
                            UNLV, Dept. of Geoscience
                        </h3>
                        <h4 className="job-title">
                            Student Accessibility Web Developer
                        </h4>
                        <p className="job-period">Jan 2023 - Sep 2023</p>
                        <ul className="job-description">
                            <li>Ensured equal access to information and functionality across FIA and DATIM websites by addressing accessibility violations defined by WCAG and Section 508</li>
                            <li>Created contingency website for UNLV FIA, providing the group with a redundant copy of essential information and functions from the primary site</li>
                        </ul>
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
                    </article>
                    <article className="job-item">
                        <h3 className="job-company">
                            Credit One Bank
                        </h3>
                        <h4 className="job-title">
                            Full Stack Developer Intern
                        </h4>
                        <p className="job-period">Jun 2022 - Jan 2023</p>
                        <ul className="job-description">
                            <li>Developed a React-based web application that would allow any user to calculate the payoff timeline for a user-defined number of loans</li>
                            <li>Deployed various endpoints for a RESTful API that will be utilized in the company's modernized mobile website</li>
                        </ul>
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
                    </article>
                    <div className="resume-cta">
                        <a className="resume-link" href="https://personalsitefiles.blob.core.windows.net/professionalfiles/my-resume-2025.pdf" target="_blank" rel="noopener noreferrer">
                            View Full Resume →
                        </a>
                    </div>
                </div>
            </section>
            <section id="projects" className="projects-section" aria-labelledby="projects-heading">
                <h2 className="section-heading" id="projects-heading">Projects</h2>
                <RepoList items={[
                    {
                        name: "Design and Analysis Toolkit for Inventory and Monitoring (DATIM)",
                        description: "DATIM is a suite of software tools used for designing inventory and monitoring programs "
                        + "and analyzing the results of those programs.",
                        link: "https://apps.fs.usda.gov/DATIM/Default.aspx?",
                        skills: ["C#", "JavaScript", "JQuery", "ASP.NET", "HTML", "CSS", "Git"]
                    },
                    {
                        name: "Joint Training Tool",
                        description: "A government-owned, cloud-based, web-enabled, single digital environment accessible worldwide. "
                                        + "The tool supports collaborative planning and training for geographically separated commands "
                                        + "focused at the strategic and operational levels of war.",
                        link: "",
                        skills: ["Javascript", "React", "Docker", "Cesium", "CI/CD", "HTML", "CSS", "Git"]
                    }
                ]}/>
            </section>
        </div>
    </div>
}