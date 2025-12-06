import React from 'react';
import { RepoList } from '../RepoList/RepoList';
import { Project } from '../../types/content';

interface ProjectsSectionProps {
    projects: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
    return (
        <section id="projects" className="projects-section" aria-labelledby="projects-heading">
            <h2 className="section-heading" id="projects-heading">Projects</h2>
            <RepoList items={projects} />
        </section>
    );
};
