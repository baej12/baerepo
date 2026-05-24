import { Job } from '../types/content';

const jobsData: Job[] = [
  {
    id: 'hii-2025',
    company: 'Mission Technologies (HII)',
    title: 'Software Engineer II',
    period: 'Jun 2025 - Present',
    description: [
      'Lead the Helm chart update effort for multiple services, standardizing deployments across teams and aligning them with the organization\'s new baseline.',
      'Merged a separate execution services module into the core project, adding map-based unit management and simulation capabilities without disrupting existing functionality.',
      'Serve as the primary on-site engineer for integration events, deploying updated project versions to secure environments, supporting testers, triaging issues, and resolving deployment problems in real time.',
      'Act as Dev Lead for the Execution Control Team, owning backlog management, agile ceremonies, and cross-team status reporting.',
      'Drive migration of services from CockroachDB to PostgreSQL as part of a broader database consolidation initiative.',
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Spring Boot', 'Docker', 'Kubernetes', 'Helm', 'GitLab CI/CD', 'PostgreSQL', 'CockroachDB', 'CesiumJS'],
    location: { city: 'Suffolk', state: 'VA', coordinates: [-76.5836, 36.7282] },
  },
  {
    id: 'insight-global-2024',
    company: 'Insight Global (HII Subcontractor)',
    title: 'Secret Mid Software Engineer',
    period: 'Sep 2024 - Jun 2025',
    description: [
      'Optimized backend service endpoints by replacing full-entity loads with partial fetch queries, reducing response latency by at least 10x.',
      'Converted the application mapping system from OpenLayers to Cesium while preserving feature parity across 2D and 3D map views.',
      'Built service endpoints for the Army\'s JAWS API, decoding protobuf responses and shaping data so the frontend could display over 500k map pins per report while maintaining smooth post-load navigation.',
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Java', 'Spring Boot', 'CesiumJS', 'Docker', 'GitLab CI/CD', 'Protobuf'],
    location: { city: 'Suffolk', state: 'VA', coordinates: [-76.5836, 36.7282] },
  },
  {
    id: 'nsa-2024',
    company: 'National Security Agency',
    title: 'Conditional Job Offer as Software Engineer',
    period: 'Feb 2024 - Sep 2024',
    descriptionText:
      'During this time period, I received a conditional job offer from the National Security Agency. However, due to the lengthy investigation process, I elected to pursue employment elsewhere.',
    description: [],
    skills: [],
    location: { city: 'Fort Meade', state: 'MD', coordinates: [-76.7706, 39.1136] },
  },
  {
    id: 'raytheon-2023',
    company: 'Raytheon',
    title: 'Software Engineer P1',
    period: 'Oct 2023 - Feb 2024',
    description: [
      'Maintained and updated training material, documentation, and guides for commonly used department tools',
      'Streamlined the onboarding process, significantly reducing assimilation time',
      'Participated in technical review of various proprietary development applications',
      'Contributed to the development of a model project showcasing departmental best practices for incorporating test executives into software and hardware',
    ],
    skills: ['C#', 'ATEasy', 'Test Stand', 'Azure DevOps'],
    location: { city: 'Tucson', state: 'AZ', coordinates: [-110.9747, 32.2226] },
  },
  {
    id: 'unlv-2023',
    company: 'UNLV, Dept. of Geoscience',
    title: 'Student Accessibility Web Developer',
    period: 'Jan 2023 - Sep 2023',
    description: [
      'Ensured equal access to information and functionality across FIA and DATIM websites by addressing accessibility violations defined by WCAG and Section 508',
      'Created contingency website for UNLV FIA, providing the group with a redundant copy of essential information and functions from the primary site',
    ],
    skills: ['C#', 'JavaScript', 'JQuery', 'ASP.NET', 'HTML', 'CSS', 'Git'],
    location: { city: 'Las Vegas', state: 'NV', coordinates: [-115.1391, 36.1716] },
  },
  {
    id: 'credit-one-2022',
    company: 'Credit One Bank',
    title: 'Full Stack Developer Intern',
    period: 'Jun 2022 - Jan 2023',
    description: [
      'Developed a React-based web application that would allow any user to calculate the payoff timeline for a user-defined number of loans',
      "Deployed various endpoints for a RESTful API that will be utilized in the company's modernized mobile website",
    ],
    skills: ['Java', 'TypeScript', 'React.js', 'Spring', 'PostgreSQL', 'HTML', 'CSS', 'Git'],
    location: { city: 'Las Vegas', state: 'NV', coordinates: [-115.1391, 36.1716] },
  },
];

export default jobsData;
