import axios from "axios";
import { useEffect, useState, memo } from "react";
import './RepoList.css'
import { IRepoList } from "../Interfaces/IRepoList";

interface Item {
    name: string;
    html_url: string;
    language: string | null;
    description: string | null;
    languages_url?: string;
    default_branch?: string;
    updated_at?: string;
}

interface CommitItem {
    sha: string;
    commit: {
        message: string;
        author: {
            date: string;
        };
    };
}

interface RepoMeta {
    languages: string[];
    recentCommits: Array<{ sha: string; message: string; date: string }>;
}

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME || 'baej12';
const MAX_LANGUAGES = 4;
const MAX_RECENT_COMMITS = 3;

export const RepoList = memo((props: IRepoList) => {
    const [repo, setRepo] = useState<Item[]>([]);
    const [repoMeta, setRepoMeta] = useState<Record<string, RepoMeta>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch repos then enrich each card with language breakdown and recent commits.
        axios.get<Item[]>(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
            params: {
                sort: 'updated',
                direction: 'desc',
                per_page: 100,
            },
        })
            .then(async response => {
                const repos = [...response.data].sort((a, b) => {
                    const aUpdated = a.updated_at ? Date.parse(a.updated_at) : 0;
                    const bUpdated = b.updated_at ? Date.parse(b.updated_at) : 0;
                    return bUpdated - aUpdated;
                });
                setRepo(repos);

                const metadataEntries = await Promise.all(
                    repos.map(async (repository) => {
                        try {
                            const [languagesResponse, commitsResponse] = await Promise.all([
                                repository.languages_url
                                    ? axios.get<Record<string, number>>(repository.languages_url)
                                    : Promise.resolve({ data: {} as Record<string, number> }),
                                axios.get<CommitItem[]>(
                                    `https://api.github.com/repos/${GITHUB_USERNAME}/${repository.name}/commits`,
                                    {
                                        params: {
                                            sha: repository.default_branch ?? 'main',
                                            per_page: MAX_RECENT_COMMITS,
                                        },
                                    }
                                ),
                            ]);

                            const languages = Object.entries(languagesResponse.data)
                                .sort((a, b) => b[1] - a[1])
                                .map(([name]) => name)
                                .slice(0, MAX_LANGUAGES);

                            const recentCommits = commitsResponse.data.map((commit) => ({
                                sha: commit.sha.slice(0, 7),
                                message: commit.commit.message.split('\n')[0],
                                date: new Date(commit.commit.author.date).toLocaleDateString(),
                            }));

                            return [repository.name, { languages, recentCommits }] as const;
                        } catch (metaError) {
                            console.warn(`Unable to fetch metadata for repo: ${repository.name}`, metaError);
                            return [repository.name, { languages: [], recentCommits: [] }] as const;
                        }
                    })
                );

                setRepoMeta(Object.fromEntries(metadataEntries));
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
            (() => {
                const metadata = repoMeta[item.name];
                const languages = metadata?.languages?.length
                    ? metadata.languages
                    : item.language
                        ? [item.language]
                        : [];
                const commits = metadata?.recentCommits ?? [];

                return (
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
                {languages.length > 0 && (
                    <div className="job-skill-list">
                        {languages.map((language) => (
                            <span key={`${item.name}-${language}`} className="job-skill minimal">{language}</span>
                        ))}
                    </div>
                )}

                {commits.length > 0 && (
                    <div className="repo-commits" aria-label={`Recent commits for ${item.name}`}>
                        <h4 className="repo-commits-title">Recent commits</h4>
                        <ul className="repo-commits-list">
                            {commits.map((commit) => (
                                <li key={`${item.name}-${commit.sha}`} className="repo-commit-item">
                                    <span className="repo-commit-message">{commit.message}</span>
                                    <span className="repo-commit-meta">{commit.sha} · {commit.date}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </a>
                );
            })()
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