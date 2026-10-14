import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileDown, LockKeyhole, ShieldCheck, Smartphone, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingHeader from './components/LandingHeader';
import { APK_INCLUDED } from './apkConfig';
import './landing.css';
import './onboarding.css';

// SHA-256 of the original APK supplied for this project; the binary is not modified.
const apkHash = '5d44beae6e2a0c9cc06fc5dacc7f2b40f239a4de1b03d5f11238fd629f5ae117';
const releaseUrl = (import.meta.env.VITE_SOILSENSE_APK_URL || '').trim();
const apkUrl = releaseUrl || (APK_INCLUDED ? '/SoilSense.apk' : '');

export default function DownloadPage() {
  return <main className="landing-page ss-subpage">
    <LandingHeader />
    <section className="ss-subpage-hero ss-download-hero">
      <div className="landing-shell">
        <div className="ss-overline"><Smartphone /> SOILSENSE FOR ANDROID</div>
        <h1>Soil readings in your pocket.</h1>
        <p>Install the SoilSense mobile app to review readings from your assigned sensor, see crop rankings, and access your Smart Crop Plan.</p>
      </div>
    </section>
    <section className="landing-shell ss-download-layout">
      <article className="ss-download-main">
        <span className="ss-download-icon"><FileDown /></span>
        <span className="ss-card-kicker">OFFICIAL PROJECT APK</span>
        <h2>Download SoilSense</h2>
        <p>Android package provided with the SoilSense project. Download the project APK here—no admin web login or Play Store account is needed for the download.</p>
        {apkUrl ? <a className="ss-action ss-action-primary ss-download-button" href={apkUrl} download={releaseUrl ? undefined : 'SoilSense.apk'}><Download /> Download APK <ArrowRight /></a> : <div className="ss-form-note" role="status">The APK download link has not been configured yet. The website owner needs to upload the APK as a GitHub Release and set VITE_SOILSENSE_APK_URL in Vercel.</div>}
        <div className="ss-download-meta"><span><CheckCircle2 /> Android APK</span><span><CheckCircle2 /> Approximately 57 MB</span></div>
        <div className="ss-hash-box"><strong>File verification (SHA-256)</strong><code>{apkHash}</code></div>
        <p className="ss-form-note">Install only if you trust this project and its developer. The team should verify Android compatibility, app signing, and permissions on the target phone before public distribution.</p>
      </article>
      <aside className="ss-download-guide">
        <h2>How to install and start</h2>
        <ol>
          <li><strong>Download the APK.</strong><span>Tap the download button from your Android device.</span></li>
          <li><strong>Open the downloaded file.</strong><span>Android may request permission for your browser/file manager to install this app.</span></li>
          <li><strong>Install and open SoilSense.</strong><span>Use the existing farmer login or registration inside the mobile app.</span></li>
          <li><strong>Ask for device assignment.</strong><span>The administrator assigns the physical scanner to your account.</span></li>
          <li><strong>Connect and scan.</strong><span>Use the device's Wi-Fi setup process (2.4 GHz) and start measuring soil.</span></li>
        </ol>
        <div className="ss-download-reminder"><Wifi /><span>The soil scanner needs an internet-connected 2.4 GHz Wi-Fi network to synchronize readings.</span></div>
      </aside>
    </section>
    <section className="landing-shell ss-after-download">
      <div><LockKeyhole /><span><strong>For farmers, not administrators.</strong><small>Farmer registration happens inside the Android app. The web admin portal is for authorized personnel.</small></span></div>
      <div><ShieldCheck /><span><strong>Device ownership protects readings.</strong><small>Only the assigned account receives its own private soil records.</small></span></div>
    </section>
    <div className="landing-shell ss-page-back"><Link to="/get-started"><ArrowLeft /> Back to Get Started</Link></div>
    <footer className="ss-subfooter"><div className="landing-shell"><span>SoilSense · Smart Soil. Better Harvest.</span><Link to="/login">Authorized admin login</Link></div></footer>
  </main>;
}
