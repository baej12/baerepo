export interface Job {
  id: string;
  company: string;
  title: string;
  period: string;
  descriptionText?: string;
  description: string[];
  skills: string[];
  location?: {
    city: string;
    state: string;
    coordinates: [number, number];
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
  skills: string[];
}

export interface AboutContent {
  greeting: string;
  paragraphs: string[];
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  resumeUrl: string;
}
