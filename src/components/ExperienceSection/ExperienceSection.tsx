import React from 'react';
import { Job } from '../../types/content';

interface ExperienceSectionProps {
    jobs: Job[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ jobs }) => {
    return (
        <section id="experience" className="experience-section" aria-labelledby="experience-heading">
            <h2 className="section-heading" id="experience-heading">Experience</h2>
            <div className="experience-content">
                {jobs.map((job) => (
                    <article key={job.id} className="job-item">
                        <h3 className="job-company">{job.company}</h3>
                        <h4 className="job-title">{job.title}</h4>
                        <p className="job-period">{job.period}</p>
                        {job.descriptionText && (
                            <p className="job-description-text">{job.descriptionText}</p>
                        )}
                        {job.description.length > 0 && (
                            <ul className="job-description">
                                {job.description.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        )}
                        {job.skills.length > 0 && (
                            <div className="job-skill-list">
                                {job.skills.map((skill, idx) => (
                                    <span key={idx} className="job-skill minimal">{skill}</span>
                                ))}
                            </div>
                        )}
                    </article>
                ))}
                <div className="resume-cta">
                    <button className="resume-link" onClick={() => window.dispatchEvent(new CustomEvent('openResume'))}>
                        View Full Resume →
                    </button>
                </div>
            </div>
        </section>
    );
};
