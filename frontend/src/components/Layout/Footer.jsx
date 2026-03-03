import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Mail } from 'lucide-react';

const socials = [
  { href: 'https://twitter.com', label: 'Twitter' },
  { href: 'https://www.linkedin.com', label: 'LinkedIn' },
  { href: 'mailto:hello@smarteducation.ai', label: 'Email' }
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--surface)', color: 'var(--brand-100)' }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--brand-100)' }}>Smart Education</h3>
          <p className="text-sm" style={{ color: 'var(--brand-200)' }}>
            Adaptive knowledge mapping and revision intelligence for institutions that demand accountable learning outcomes.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--accent)' }}>Product</h4>
          <ul className="mt-4 space-y-2 text-sm" style={{ color: 'var(--brand-200)' }}>
            <li><Link to="/" className="hover:text-accent">Knowledge graph</Link></li>
            <li><Link to="/" className="hover:text-accent">Revision engine</Link></li>
            <li><Link to="/" className="hover:text-accent">Reporting suite</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--accent)' }}>Company</h4>
          <ul className="mt-4 space-y-2 text-sm" style={{ color: 'var(--brand-200)' }}>
            <li><Link to="/about" className="hover:text-accent">About</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
            <li><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-accent">Careers</a></li>
          </ul>
        </div>

        <div className="flex flex-col items-center">
          <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-center" style={{ color: 'var(--accent)' }}>Connect</h4>
          <div className="mt-4 flex gap-4 justify-center">
            {socials.map((s) => {
              const Icon = s.href.includes('twitter') ? Twitter : s.href.includes('linkedin') ? Linkedin : Mail;
              return (
                <a
                  key={s.href}
                  href={s.href}
                  aria-label={s.label}
                  title={s.label}
                  target={s.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={s.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  className="flex h-12 w-12 items-center justify-center rounded-full transition hover:-translate-y-1"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: 'var(--brand-100)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.12)'
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: s.href.includes('twitter') ? 'var(--accent)' : s.href.includes('linkedin') ? 'var(--brand-300)' : 'var(--brand-200)' }} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--brand-800)', backgroundColor: 'var(--brand-950)', color: 'var(--brand-300)' }} className="py-4 text-center text-xs uppercase tracking-[0.3em]">
        (c) {new Date().getFullYear()} Smart Education. All rights reserved.
      </div>
    </footer>
  );
}
