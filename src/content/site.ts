export type Project = {
  title: string;
  category: 'Web Development' | '3D Experience' | 'AI & Automation';
  summary: string;
  detail: string;
  tags: string[];
  visual: 'web' | 'three' | 'ai';
  demoUrl?: string;
  githubUrl?: string;
};

// Replace these editorial examples with real work before publishing.
export const profile = {
  name: 'priyanshu kumar',
  initials: 'YN',
  email: 'pk9120079785@gmail.com',
  location: 'Available worldwide',
  intro: 'I design and build digital experiences where thoughtful engineering meets expressive interaction.',
  about: 'I work across full-stack products, immersive 3D interfaces, and practical AI workflows. This space is a preview of how those disciplines can come together. Add your background, approach, and real work here.',
  social: [] as { label: string; url: string }[],
};

export const projects: Project[] = [
  {
    title: 'Product Interface Concept', category: 'Web Development',
    summary: 'A considered interface for a modern digital product.',
    detail: 'Example presentation slot · replace with a real full-stack application, its challenge, and your contribution.',
    tags: ['Next.js', 'TypeScript', 'UI Engineering'], visual: 'web',
  },
  {
    title: 'Spatial Web Concept', category: '3D Experience',
    summary: 'An immersive environment shaped for the browser.',
    detail: 'Example presentation slot · replace with a real Three.js experience and interaction details.',
    tags: ['Three.js', 'React Three Fiber', 'WebGL'], visual: 'three',
  },
  {
    title: 'Intelligent Workflow Concept', category: 'AI & Automation',
    summary: 'A human-centered approach to an automated workflow.',
    detail: 'Example presentation slot · replace with a real agent, its inputs, outputs, safeguards, and impact.',
    tags: ['AI Agents', 'Automation', 'API Design'], visual: 'ai',
  },
];

export const skills = [
  { category: 'Web engineering', items: ['React', 'Next.js', 'TypeScript', 'Node.js', 'APIs', 'Accessible UI'] },
  { category: 'Creative development', items: ['Three.js', 'React Three Fiber', 'WebGL', 'Motion Design', 'Interactive Systems'] },
  { category: 'AI & automation', items: ['Agent Workflows', 'LLM APIs', 'Tool Integration', 'Prompt Design', 'Evaluation'] },
];
