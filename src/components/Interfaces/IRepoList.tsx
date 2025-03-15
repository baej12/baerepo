export interface IProjectItem {
    name: string,
    description: string,
    link: string
    skills: string[]
}

export interface IRepoList {
    items: IProjectItem[]
}