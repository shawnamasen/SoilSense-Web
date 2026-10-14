import { Menu, Sprout, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <header className="landing-header">
    <div className="landing-shell landing-nav">
      <Link className="landing-brand" to="/" onClick={close}>
        <span className="landing-brand-mark"><Sprout /></span>
        <span className="landing-brand-copy"><strong>Soil<span>Sense</span></strong><small>Smart Soil. Better Harvest.</small></span>
      </Link>
      <nav className={`landing-links ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        <a href="/#home" onClick={close}>Home</a>
        <a href="/#features" onClick={close}>Features</a>
        <a href="/#how" onClick={close}>How it works</a>
        <a href="/#plans" onClick={close}>Pricing</a>
        <Link to="/download" onClick={close}>Download app</Link>
      </nav>
      <div className="landing-nav-actions">
        <Link className="landing-btn landing-btn-primary landing-nav-cta" to="/get-started">Get started</Link>
        <button className="landing-menu-btn" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </div>
  </header>;
}
