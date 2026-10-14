import { Component } from 'react';
import { Link } from 'react-router-dom';

// React render failures should never leave the admin workspace as a blank white page.
// The boundary remounts on route changes, so a broken page cannot poison other tabs.
export default class AdminPageBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // Keep exception details out of the browser console and visible pages.
  }

  render() {
    if (this.state.failed) {
      return <section className="admin-card admin-page-error" role="alert">
        <h2>Page could not be displayed</h2>
        <p>An unexpected page error occurred. Your other admin sections are still available. Please try again or return to the dashboard.</p>
        <div className="admin-actions">
          <button
            type="button"
            className="admin-btn"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
          <Link to="/admin/dashboard" className="admin-btn">Return to dashboard</Link>
        </div>
      </section>;
    }
    return this.props.children;
  }
}
