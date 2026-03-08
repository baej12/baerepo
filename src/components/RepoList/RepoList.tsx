import axios from "axios";
import { useEffect, useState, memo } from "react";
import './RepoList.css'
import { IRepoList } from "../Interfaces/IRepoList";

interface Item {
    name: string;
    html_url: string;
    language: string;
    description: string;
}

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME || 'baej12';

export const RepoList = memo((props: IRepoList) => {
    const [repo, setRepo] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        //Gets the repos 
        axios.get<Item[]>(`https://api.github.com/users/${GITHUB_USERNAME}/repos`)
            .then(response => {
                setRepo(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to load GitHub repositories. Please try again later.');
                setLoading(false);
            });
    }, [])


    return <div className="project-item">
        {loading ? (
            <div className="loading-skeleton">
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
            </div>
        ) : error ? (
            <p className="error-message">{error}</p>
        ) : (
            repo.map((item, index) => (
            <a
                key={index}
                className="project-card"
                href={item.html_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${item.name} on GitHub`}
            >
                <h3 className="item-name">{item.name}</h3>
                <p className="item-desc">
                    {item.description != null ? item.description : "Oops! I didn't write a description for this repository"}
                </p>
                {item.language && (
                    <div className="job-skill-list">
                        <span className="job-skill minimal">{item.language}</span>
                    </div>
                )}
            </a>
            ))
        )}
        {props?.items?.map((item, index)  => (
            item.link ? (
                <a
                    key={'p' + index}
                    className="project-card"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${item.name}`}
                >
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-desc">
                        {item.description != null ? item.description : "Oops! I didn't write a description for this project"}
                    </p>
                    <div className="job-skill-list">
                        {item.skills ? item.skills.map((skill, skillIndex) => (
                            <span key={'i' + skillIndex} className="job-skill minimal">{skill}</span>
                        )): null}
                    </div>
                </a>
            ) : (
                <article key={'p' + index} className="project-card">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-desc">
                        {item.description != null ? item.description : "Oops! I didn't write a description for this project"}
                    </p>
                    <div className="job-skill-list">
                        {item.skills ? item.skills.map((skill, skillIndex) => (
                            <span key={'i' + skillIndex} className="job-skill minimal">{skill}</span>
                        )): null}
                    </div>
                </article>
            )
        ))}
    </div>
});

RepoList.displayName = 'RepoList';