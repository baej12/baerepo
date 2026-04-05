import { memo } from "react";
import './RepoList.css'
import { IRepoList } from "../Interfaces/IRepoList";
import generatedRepoStats from "../../data/repoStats.generated";

export const RepoList = memo((props: IRepoList) => {
    const latestGeneratedUpdate = generatedRepoStats.reduce<Date | null>((latest, repo) => {
        if (!repo.updatedAt) return latest;
        const parsed = new Date(repo.updatedAt);
        if (Number.isNaN(parsed.getTime())) return latest;
        if (!latest || parsed > latest) return parsed;
        return latest;
    }, null);

    const localLastUpdated = latestGeneratedUpdate
        ? latestGeneratedUpdate.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
        : null;

    const utcLastUpdated = latestGeneratedUpdate
        ? `${latestGeneratedUpdate.toISOString().slice(0, 16).replace('T', ' ')} UTC`
        : null;

    return <div className="project-item">
        {latestGeneratedUpdate && (
            <div className="repo-stats-updated" aria-label="Repository stats freshness">
                Repo stats last refreshed: {localLastUpdated} ({utcLastUpdated})
            </div>
        )}
        {generatedRepoStats.map((item, index) => {
            const languages = item.languages?.length
                ? item.languages
                : item.primaryLanguage
                    ? [item.primaryLanguage]
                    : [];
            const commits = item.recentCommits ?? [];

            return (
            <a
                key={index}
                className="project-card"
                href={item.htmlUrl}
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
                                    <span className="repo-commit-meta">
                                        +{commit.additions} / -{commit.deletions} · {commit.changedFiles} files changed
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </a>
            );
        })}
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
