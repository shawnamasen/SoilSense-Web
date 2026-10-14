import { useEffect, useState } from 'react';
import { Mail, Moon, Save, ShieldCheck, Sun, UserRound, Link2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../../auth/context/AuthContext';
import { auth } from '../../services/firebase';
import { useAdminPreferences } from '../context/AdminPreferencesContext';
import { friendlyGoogleAuthError } from '../../auth/friendlyGoogleAuthError';
import { safeErrorMessage } from '../../shared/safeErrorMessage';

export default function AdminSettings() {
  const { user, linkGoogleToCurrentAdmin } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleMessage, setGoogleMessage] = useState('');
  const [googleLinked, setGoogleLinked] = useState(() => Boolean(auth?.currentUser?.providerData?.some(item => item.providerId === 'google.com')));
  const { preferences, loading, error: preferenceError, save, setPreference } = useAdminPreferences();
  const [draft, setDraft] = useState(preferences);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => setDraft(preferences), [preferences]);

  async function sendPasswordReset() {
    if (!auth || !user?.email) return;
    setPasswordMessage('');
    setPasswordLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordMessage('Password reset email sent.');
    } catch (err) {
      // Avoid exposing provider error details in the browser console.
      setPasswordMessage('Unable to send the reset email right now.');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function connectGoogle() {
    setGoogleMessage('');
    setGoogleLoading(true);
    try {
      const result = await linkGoogleToCurrentAdmin();
      setGoogleLinked(true);
      setGoogleMessage(result.alreadyLinked
        ? 'Google is already linked to your administrator account.'
        : 'Google was linked to this administrator account. You can now use Google sign-in with the same admin profile.');
    } catch (err) {
      setGoogleMessage(friendlyGoogleAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  async function savePreferences() {
    setSaving(true);
    setError('');
    try {
      await save({ ...draft, darkMode: preferences.darkMode });
      setNotice('Admin portal preferences saved to Firestore.');
      window.setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      setError(safeErrorMessage(err, 'Unable to save settings. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  function toggle(key) {
    setDraft(current => ({ ...current, [key]: !current[key] }));
  }

  return <>
    <div className="admin-page-head">
      <div><h1>Settings</h1><p>Manage the signed-in administrator account and persistent portal preferences.</p></div>
    </div>

    {notice && <div className="admin-inline-alert success">{notice}</div>}
    {(error || preferenceError) && <div className="admin-inline-alert error">{error || preferenceError}</div>}

    <section className="admin-settings-grid">
      <div className="admin-card">
        <h2>Admin Profile</h2>
        <div className="admin-profile-big">
          <span className="admin-avatar"><UserRound /></span>
          <h2>{user?.name || 'System Administrator'}</h2>
          <p className="admin-card-sub">{user?.email || 'No email available'}</p>
          <div className="admin-profile-badges"><span className="admin-status"><ShieldCheck /> Verified Administrator</span></div>
        </div>
      </div>

      <div className="admin-card">
        <h2>Password & Sign-In</h2>
        <p className="admin-card-sub" style={{ marginTop: 8 }}>Password changes use Firebase Authentication&apos;s secure reset flow. SoilSense does not store administrator passwords.</p>
        <button className="admin-btn primary" type="button" style={{ marginTop: 16 }} onClick={sendPasswordReset} disabled={passwordLoading}>
          <Mail /> {passwordLoading ? 'Sending…' : 'Send Password Reset Email'}
        </button>
        {passwordMessage && <p className="admin-card-sub" style={{ marginTop: 10 }}>{passwordMessage}</p>}
        <div style={{ marginTop: 22 }}>
          <h3>Google Sign-In</h3>
          <p className="admin-card-sub" style={{ marginTop: 8 }}>Already signed in as an approved administrator? Link your Google account to this same administrator UID. Do this once before using Google sign-in on the Login page.</p>
          <button className="admin-btn" type="button" style={{ marginTop: 12 }} onClick={connectGoogle} disabled={googleLoading || googleLinked}>
            <Link2 /> {googleLoading ? 'Connecting…' : googleLinked ? 'Google already connected' : 'Connect Google to this admin account'}
          </button>
          {googleMessage && <p className="admin-card-sub" role="status" style={{ marginTop: 10 }}>{googleMessage}</p>}
        </div>
      </div>
    </section>

    <section className="admin-settings-grid" style={{ marginTop: 14 }}>
      <div className="admin-card">
        <div className="admin-card-head"><div><h2>Appearance & Table Size</h2><p className="admin-card-sub">Saved per administrator account.</p></div></div>
        
        <div className="admin-setting-theme-preview">
          <span className="admin-theme-preview-icon">
            {preferences.darkMode ? <Moon /> : <Sun />}
          </span>

          <div>
            <strong>
              {preferences.darkMode ? 'Dark Mode' : 'Light Mode'}
            </strong>
            <small>
              Switch between light and dark themes.
            </small>
          </div>

          <button
            className={`admin-toggle ${preferences.darkMode ? 'on' : ''}`}
            type="button"
            disabled={loading}
            onClick={async () => {
              try {
                setError('');
                await setPreference(
                  'darkMode',
                  !preferences.darkMode
                );
              } catch (err) {
                setError('Unable to change theme. Please try again.');
              }
            }}
            aria-label="Toggle dark mode"
            aria-pressed={Boolean(preferences.darkMode)}
          />
        </div>

        <div className="admin-field" style={{ marginTop: 18 }}>
          <label>Items per table page</label>
          <select className="admin-input" value={draft.itemsPerPage} onChange={event => setDraft(current => ({ ...current, itemsPerPage: Number(event.target.value) }))}>
            <option value="10">10</option><option value="20">20</option><option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-head"><div><h2>Portal Alerts</h2><p className="admin-card-sub">Controls what appears in the bell menu. These are in-app admin alerts, not email or push notifications.</p></div></div>
        <Toggle title="Device Offline" subtitle="Show an alert when the ESP32 heartbeat is stale for more than 60 seconds." on={draft.alertDeviceOffline} onClick={() => toggle('alertDeviceOffline')} />
        <Toggle title="No Current Owner" subtitle="Show an alert when the SoilSense device is unassigned." on={draft.alertUnassignedOwner} onClick={() => toggle('alertUnassignedOwner')} />
        <Toggle title="Inactive Accounts" subtitle="Optionally surface inactive farmer/technician accounts." on={draft.alertInactiveAccounts} onClick={() => toggle('alertInactiveAccounts')} />
      </div>
    </section>

    <section className="admin-settings-grid" style={{ marginTop: 14 }}>
      <div className="admin-card">
        <h2>System Behavior</h2>
        <div className="admin-detail-list admin-settings-detail-list">
          <Row a="Device offline threshold" b="60 seconds" />
          <Row a="Ownership model" b="1 device · 1 current owner" />
          <Row a="Analytics privacy" b="Aggregate metadata only" />
        </div>
      </div>
      <div className="admin-card">
        <h2>Privacy & Data Scope</h2>
        <p className="admin-card-sub admin-settings-privacy">The admin portal uses account status, scan counts, timestamps, device metadata, reports/alert counts and audit events for administration. Analytics pages do not display individual NPK, pH, moisture, temperature or EC values.</p>
        <p className="admin-card-sub admin-settings-privacy">Historical private soil readings remain assigned to their original user when device ownership changes.</p>
      </div>
    </section>

    <div className="admin-settings-savebar">
      <span>{loading ? 'Loading preferences…' : 'Changes are not applied permanently until saved.'}</span>
      <button className="admin-btn primary" type="button" onClick={savePreferences} disabled={saving || loading}><Save /> {saving ? 'Saving…' : 'Save Portal Settings'}</button>
    </div>
  </>;
}

function Toggle({ title, subtitle, on, onClick }) {
  return <div className="admin-toggle-row">
    <div className="admin-toggle-copy"><strong>{title}</strong><small>{subtitle}</small></div>
    <button className={`admin-toggle ${on ? 'on' : ''}`} type="button" onClick={onClick} aria-label={`Toggle ${title}`} />
  </div>;
}

function Row({ a, b }) { return <div className="admin-detail-row"><span>{a}</span><strong>{b}</strong></div>; }
