import axios, { AxiosResponse } from "axios";
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

    async function getGitRepoList() : Promise<void> {
        try {
            let response : AxiosResponse<any> = await axios.get("https://api.github.com/users/baej12/repos");
            setRepo(response.data);
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        axios.get<Item[]>('https://api.github.com/users/baej12/repos')
            .then(response => setRepo(response.data))
            .catch(error => console.error('Error fetching data:', error));
    }, [])


    return <div className="project-item">
        {repo.length === 0 ? (
            <p>Loading...</p>
        ) : (
            repo.map((item, index) => (
            <div key={index} className="item">
                {item.name} {}
            </div>
            ))
        )}
    </div>
}