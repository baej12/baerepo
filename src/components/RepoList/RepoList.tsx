import axios from "axios";
import { useEffect, useState } from "react";
import './RepoList.css'

export const RepoList = () => {
    const [repo, setRepo] = useState<Item[]>([]);

    interface Item {
        name: string;
        html_url: string;
        language: string;
        description: string;
    }

    useEffect(() => {
        //Gets the repos 
        axios.get<Item[]>('https://api.github.com/users/baej12/repos')
            .then(response => setRepo(response.data))
            .catch(error => console.error('Error fetching data:', error));
    }, [])


    return <div className="project-item">
        {repo.length === 0 ? (
            <p>Loading...</p>
        ) : (
            repo.map((item, index) => (
            <a key={index} className="item" href={item.html_url}>
                <span className="item-name">
                    {item.name}
                </span>
                <span className="item-desc">
                    {item.description != null ? item.description : "Oops! I didn't write a description for this repository"}
                </span>
                <span className="item-skill">
                    {item.language}
                </span>
            </a>
            ))
        )}
    </div>
}