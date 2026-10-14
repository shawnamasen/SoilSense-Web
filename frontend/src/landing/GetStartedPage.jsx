import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardCopy, Download, Mail, PackageCheck, ShieldCheck, Smartphone, Sprout } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { businessPlans } from '../shared/businessPlans';
import LandingHeader from './components/LandingHeader';
import './landing.css';
import './onboarding.css';

const contactEmail = (import.meta.env.VITE_SOILSENSE_CONTACT_EMAIL || 'report.test.email.0@gmail.com').trim();

function inquiryText(plan, name, contact, message) {
  return [
    'Hello SoilSense team,',
    '',
    `I would like to ask about: ${plan.title}`,
    `Name: ${name.trim() || 'Not provided'}`,
    `Contact details: ${contact.trim() || 'Not provided'}`,
    `Additional questions: ${message.trim() || 'Please share availability, requirements, and next steps.'}`,
    '',
    'Please let me know the next steps. Thank you.'
  ].join('\n');
}

export default function GetStartedPage() {
  const [searchParams] = useSearchParams();
  const requestedPlan = searchParams.get('plan');
  const initialPlan = businessPlans.find(plan => plan.id === requestedPlan)?.id || 'purchase';
  const [planId, setPlanId] = useState(initialPlan);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const plan = businessPlans.find(item => item.id === planId) || businessPlans[0];
  const body = inquiryText(plan, name, contact, message);
  const subject = `SoilSense inquiry: ${plan.title}`;
  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  // Gmail's compose URL works even when the browser has no default mail application.
  // It only opens a draft; the customer must review it and click Send.
  const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  function openGmail(event) {
    event.preventDefault();
    window.open(gmailCompose, '_blank', 'noopener,noreferrer');
  }

  useEffect(() => { setPlanId(initialPlan); }, [initialPlan]);
  useEffect(() => {
    if (window.location.hash === '#inquiry') {
      const id = window.requestAnimationFrame(() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' }));
      return () => window.cancelAnimationFrame(id);
    }
    return undefined;
  }, [requestedPlan]);

  async function copyInquiry() {
    setCopied(false);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
    } catch {
      setCopyError(true);
    }
  }

  return <main className="landing-page ss-subpage">
    <LandingHeader />
    <section className="ss-subpage-hero">
      <div className="landing-shell">
        <div className="ss-overline"><Sprout /> GET STARTED</div>
        <h1>Your SoilSense journey starts here.</h1>
        <p>Already have a device? Install the Android app. Still exploring? Ask about purchase, subscription, and rent-to-own options without entering the admin portal.</p>
      </div>
    </section>

    <section className="landing-shell ss-path-grid" aria-label="Choose how to start">
      <article className="ss-path-card">
        <div className="ss-path-icon"><Smartphone /></div>
        <span className="ss-card-kicker">I ALREADY HAVE A DEVICE</span>
        <h2>Install the mobile app</h2>
        <p>Download the official SoilSense APK for Android. Create or sign in to your farmer account inside the app, then coordinate device assignment with your administrator.</p>
        <Link to="/download" className="ss-action ss-action-primary">Download for Android <Download /></Link>
      </article>
      <article className="ss-path-card ss-path-card-green">
        <div className="ss-path-icon"><PackageCheck /></div>
        <span className="ss-card-kicker">I NEED A DEVICE</span>
        <h2>Explore device options</h2>
        <p>Ask about buying a scanner, proposed monthly access, rent-to-own, or a cooperative deployment. A SoilSense team member can discuss availability and setup.</p>
        <a className="ss-action ss-action-primary" href="#inquiry">Prepare a plan inquiry <ArrowRight /></a>
      </article>
    </section>

    <section className="landing-shell ss-onboarding-steps" aria-label="How to begin using SoilSense">
      <h2>How you start using SoilSense</h2>
      <div className="ss-step-grid">
        {[['01', 'Download & install', 'Get the APK from this website and install it on your Android phone.'],
          ['02', 'Sign in on mobile', 'Create or use your farmer account inside the existing SoilSense app.'],
          ['03', 'Admin assigns device', 'An authorized administrator assigns the device to the correct account.'],
          ['04', 'Connect & scan', 'Configure the scanner with 2.4 GHz Wi-Fi and collect soil readings.'],
          ['05', 'Review results', 'See soil measurements, crop suitability ranking, and Smart Crop Plan.']]
          .map(([number, title, text]) => <div className="ss-step" key={number}><strong>{number}</strong><h3>{title}</h3><p>{text}</p></div>)}
      </div>
    </section>

    <section id="inquiry" className="ss-inquiry-section">
      <div className="landing-shell ss-inquiry-layout">
        <div className="ss-inquiry-copy">
          <div className="ss-overline">SOILSENSE BUSINESS OPTIONS</div>
          <h2>Find the right device option.</h2>
          <p>These are proposed business plans, not live purchases. Choose an option, prepare your message, and send it to our SoilSense team by email. The website does not collect payments or activate subscriptions.</p>
          <div className="ss-info-lines">
            <div><CheckCircle2 /> No payment required to inquire</div>
            <div><CheckCircle2 /> Device access is approved by the administrator</div>
            <div><ShieldCheck /> You review and send the message from your own email account</div>
          </div>
        </div>
        <div className="ss-inquiry-panel">
          <h3>Contact the SoilSense team</h3>
          <p>Choose a plan and share how we can reach you. Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
          <form onSubmit={openGmail} className="ss-inquiry-form">
            <label htmlFor="ss-plan">Interested option</label>
            <select id="ss-plan" value={planId} onChange={event => {setPlanId(event.target.value); setCopied(false);}}>
              {businessPlans.map(item => <option key={item.id} value={item.id}>{item.title}{item.period ? ` — ${item.price}${item.period} (proposed)` : ''}</option>)}
            </select>
            <label htmlFor="ss-name">Your name (optional)</label>
            <input id="ss-name" value={name} maxLength={120} onChange={event => setName(event.target.value)} placeholder="Your name" />
            <label htmlFor="ss-contact">Email or phone (optional)</label>
            <input id="ss-contact" value={contact} maxLength={150} onChange={event => setContact(event.target.value)} placeholder="Your contact details" />
            <label htmlFor="ss-message">Question (optional)</label>
            <textarea id="ss-message" rows="3" maxLength={700} value={message} onChange={event => setMessage(event.target.value)} placeholder="Tell us what you want to know" />
            <div className="ss-inquiry-actions">
              <button className="ss-action ss-action-primary" type="submit"><Mail /> Open Gmail to send</button>
              <a className="ss-action ss-action-secondary" href={mailto}><Mail /> Use another email app</a>
              <button className="ss-action ss-action-secondary" type="button" onClick={copyInquiry}><ClipboardCopy /> {copied ? 'Message copied!' : 'Copy message'}</button>
            </div>
            {copyError && <p className="ss-form-note" role="alert">Your browser could not copy automatically. Select and copy the message below instead.</p>}
            <p className="ss-form-note">Gmail opens a prepared email addressed to {contactEmail}. Review the message and press <strong>Send</strong> in your email app. The website does not send it automatically.</p>
            <details className="ss-inquiry-preview"><summary>Preview inquiry message</summary><textarea readOnly rows="8" value={body} onFocus={event => event.target.select()} aria-label="Prepared inquiry message" /></details>
          </form>
        </div>
      </div>
    </section>

    <footer className="ss-subfooter"><div className="landing-shell"><span>SoilSense · Smart Soil. Better Harvest.</span><Link to="/login">Authorized admin login</Link></div></footer>
  </main>;
}
