import { Project } from '../types/content';

const projectsData: Project[] = [
  {
    id: 'datim',
    name: 'Design and Analysis Toolkit for Inventory and Monitoring (DATIM)',
    description:
      'DATIM is a suite of software tools used for designing inventory and monitoring programs and analyzing the results of those programs.',
    link: 'https://apps.fs.usda.gov/DATIM/Default.aspx?',
    skills: ['C#', 'JavaScript', 'JQuery', 'ASP.NET', 'HTML', 'CSS', 'Git'],
  },
  {
    id: 'jtt',
    name: 'Joint Training Tool',
    description:
      'A government-owned, cloud-based, web-enabled, single digital environment accessible worldwide. The tool supports collaborative planning and training for geographically separated commands focused at the strategic and operational levels of war.',
    link: '',
    skills: ['Javascript', 'React', 'Docker', 'Cesium', 'CI/CD', 'HTML', 'CSS', 'Git'],
  },
];

export default projectsData;
