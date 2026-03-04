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
    <footer className="bg-slate-900 text-white border-t border-slate-700">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Smart Education</h3>
          <p className="text-sm text-slate-300">
            Adaptive knowledge mapping and revision intelligence for institutions that demand accountable learning outcomes.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">Product</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link to="/" className="hover:text-cyan-400 transition">Knowledge graph</Link></li>
            <li><Link to="/" className="hover:text-cyan-400 transition">Revision engine</Link></li>
            <li><Link to="/" className="hover:text-cyan-400 transition">Reporting suite</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link to="/about" className="hover:text-cyan-400 transition">About</Link></li>
            <li><Link to="/contact" className="hover:text-cyan-400 transition">Contact</Link></li>
            <li><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">Careers</a></li>
          </ul>
        </div>

        <div className="flex flex-col items-center">
          <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-center text-cyan-400">Connect</h4>
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
                  className="flex h-12 w-12 items-center justify-center rounded-full transition hover:-translate-y-1 bg-slate-800 hover:bg-slate-700"
                >
                  <Icon className="h-5 w-5 text-cyan-400" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-700 bg-slate-950 py-4 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
        &copy; {new Date().getFullYear()} Smart Education. All rights reserved.
      </div>
    </footer>
  );
}
