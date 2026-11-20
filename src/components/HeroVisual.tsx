'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

export function HeroVisual() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 640px)');
    const canvas = document.createElement('canvas');
    const update = () => setEnabled(!motion.matches && !compact.matches && !!(canvas.getContext('webgl2') || canvas.getContext('webgl')));
    update();
    motion.addEventListener('change', update);
    compact.addEventListener('change', update);
    return () => { motion.removeEventListener('change', update); compact.removeEventListener('change', update); };
  }, []);
  return <div className="hero-visual"><div className="hero-orb" aria-hidden="true" />{enabled && <HeroScene />}<div className="orbit-label orbit-label-top">CREATIVE<br />SYSTEMS</div><div className="orbit-label orbit-label-bottom">FORM / FUNCTION<br />IN MOTION</div><div className="hero-code" aria-hidden="true"><span className="hero-code-label"><span className="hero-code-dot" /> interaction.js</span><pre><span className="code-purple">function</span> <span className="code-blue">animate</span>() {'{'}
  mesh.rotation.y += <span className="code-green">0.01</span>;
  requestAnimationFrame(animate);
{'}'}</pre></div></div>;
}
