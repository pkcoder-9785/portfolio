import { ArrowUpRight, Asterisk, Box, Braces, Code2, Github, Mail, MoveUpRight, Sparkles, Workflow } from 'lucide-react';
import { HeroVisual } from '@/components/HeroVisual';
import { Reveal } from '@/components/Reveal';
import { profile, projects, skills, type Project } from '@/content/site';

const nav = [
  { label: 'About', href: '#about' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
];

function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="eyebrow"><span className="eyebrow-line" />{children}</div>; }

function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return <Reveal className="section-heading"><Eyebrow>{kicker}</Eyebrow><h2>{title}</h2>{description && <p>{description}</p>}</Reveal>;
}

function ProjectVisual({ visual }: { visual: Project['visual'] }) {
  if (visual === 'web') return <div className="project-art art-web" aria-hidden="true"><div className="mock-window"><div className="mock-top"><i /><i /><i /><span>interface.preview</span></div><div className="mock-body"><div className="mock-sidebar"><b /><b /><b /><b /></div><div className="mock-main"><div className="mock-pill" /><div className="mock-title" /><div className="mock-subtitle" /><div className="mock-chart"><span /><span /><span /><span /><span /><span /><span /></div></div></div></div></div>;
  if (visual === 'three') return <div className="project-art art-three" aria-hidden="true"><div className="art-grid" /><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-core" /><span className="art-coordinate">X 48° / Y 16° / Z 02°</span></div>;
  return <div className="project-art art-ai" aria-hidden="true"><div className="flow-node node-one"><span className="flow-dot" /> INPUT</div><div className="flow-line line-one" /><div className="flow-node node-two"><Sparkles size={18} /> REASON</div><div className="flow-line line-two" /><div className="flow-node node-three"><span className="flow-dot" /> ACTION</div><div className="flow-glow" /></div>;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return <Reveal className="project-card" delay={index * 0.08}>
    <ProjectVisual visual={project.visual} />
    <div className="project-info"><div className="project-meta"><span>{project.category}</span><span>Concept preview</span></div><h3>{project.title}</h3><p>{project.summary}</p><p className="project-detail">{project.detail}</p><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      {(project.demoUrl || project.githubUrl) && <div className="project-links">{project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">Live demo <ArrowUpRight size={16} /></a>}{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">Source <Github size={16} /></a>}</div>}
    </div>
  </Reveal>;
}

export default function Home() {
  return <main id="top">
    <div className="page-glow" aria-hidden="true" />
    <header className="site-header shell"><a className="brand" href="#top" aria-label="Back to top"><span className="brand-mark"><Asterisk size={20} strokeWidth={2.4} /></span><span>{profile.initials}<small> / PORTFOLIO</small></span></a><nav aria-label="Main navigation">{nav.map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</nav><a className="header-cta" href="#contact">Let&apos;s talk <ArrowUpRight size={15} /></a></header>

    <section className="hero shell" aria-labelledby="hero-title"><div className="hero-copy"><Reveal><div className="availability"><span className="availability-dot" /> OPEN TO NEW OPPORTUNITIES <span className="availability-rule" /></div><p className="hero-intro">Hello, I&apos;m {profile.name}.</p><h1 id="hero-title">Building the <em>next dimension</em> of the web<span className="period">.</span></h1><p className="hero-description">Full-Stack Web Developer <span>/</span> 3D Website Developer <span>/</span> AI Agent Developer <span>/</span> Creative Technologist</p><p className="hero-secondary">{profile.intro}</p><div className="hero-actions"><a className="button button-primary" href="#work">Explore work <ArrowUpRight size={18} /></a><a className="button button-secondary" href="#contact">Get in touch</a></div></Reveal></div><HeroVisual /><div className="hero-bottom"><span>SCROLL TO EXPLORE</span><span>01 — 05</span></div></section>

    <section className="about-section section-pad" id="about"><div className="shell about-grid"><SectionHeading kicker="01 / THE PERSON BEHIND THE PIXELS" title="A builder at the intersection of logic and imagination." /><Reveal className="about-body"><p>{profile.about}</p><div className="about-signature"><span className="signature-symbol">✳</span><div><strong>Curious by default.</strong><span>Always exploring what the web can become.</span></div></div></Reveal></div></section>

    <section className="expertise-section section-pad" id="expertise"><div className="shell"><SectionHeading kicker="02 / WHAT I DO" title="Three disciplines. One connected practice." description="From robust product foundations to expressive interfaces and useful intelligence." /><div className="expertise-grid"><Reveal className="expertise-card" delay={0}><div className="expertise-top"><Code2 size={26} /><span>01</span></div><h3>Web development</h3><p>Thoughtful websites, applications, and dashboards built with attention to speed, usability, and detail.</p><div className="expertise-foot">FULL-STACK SYSTEMS <MoveUpRight size={16} /></div></Reveal><Reveal className="expertise-card" delay={0.08}><div className="expertise-top"><Box size={26} /><span>02</span></div><h3>3D web experiences</h3><p>Immersive browser spaces and interactive objects that add depth without getting in the way.</p><div className="expertise-foot">SPATIAL INTERACTION <MoveUpRight size={16} /></div></Reveal><Reveal className="expertise-card" delay={0.16}><div className="expertise-top"><Workflow size={26} /><span>03</span></div><h3>AI agents & automation</h3><p>Interfaces and workflows that make intelligent tools understandable and useful in practice.</p><div className="expertise-foot">INTELLIGENT WORKFLOWS <MoveUpRight size={16} /></div></Reveal></div></div></section>

    <section className="work-section section-pad" id="work"><div className="shell"><div className="work-heading"><SectionHeading kicker="03 / SELECTED WORK" title="Ideas made tangible." description="Presentation concepts show the intended format. Replace them with verified projects and real links." /><span className="work-index">FEATURED / 03</span></div><div className="project-grid">{projects.map((project, i) => <ProjectCard key={project.title} project={project} index={i} />)}</div></div></section>

    <section className="skills-section section-pad" id="skills"><div className="shell skills-grid"><SectionHeading kicker="04 / THE TOOLKIT" title="The right tools for the right idea." /><div className="skill-groups">{skills.map((group, i) => <Reveal className="skill-group" key={group.category} delay={i * 0.07}><div className="skill-index">0{i + 1}</div><div><h3>{group.category}</h3><div className="skill-list">{group.items.map(item => <span key={item}>{item}</span>)}</div></div></Reveal>)}</div></div></section>

    <section className="contact-section" id="contact"><div className="shell contact-inner"><Reveal><Eyebrow>05 / THE NEXT CHAPTER</Eyebrow><h2>Have something <em>ambitious</em> in mind?</h2><p>Let&apos;s make an experience that feels as good as it works.</p>{profile.email ? <a className="button button-primary contact-button" href={`mailto:${profile.email}`}>Let&apos;s work together <Mail size={18} /></a> : <p className="contact-placeholder">Contact details coming soon. Add an email in <code>src/content/site.ts</code> to activate this link.</p>}</Reveal><div className="contact-deco" aria-hidden="true"><Braces size={180} strokeWidth={0.7} /></div></div></section>

    <footer className="site-footer shell"><a className="brand" href="#top"><span className="brand-mark"><Asterisk size={18} /></span><span>{profile.initials}</span></a><span>© {new Date().getFullYear()} {profile.name}. Built with curiosity.</span><div className="footer-links">{profile.social.map(item => <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer">{item.label}</a>)}<a href="#top">Back to top ↑</a></div></footer>
  </main>;
}
