import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Luma Studio UI error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="system-state-page">
        <section className="system-state-card">
          <span className="brand-mark">LS</span>
          <p className="eyebrow">Luma Studio · Something went wrong</p>
          <h1>We couldn't load this page.</h1>
          <p>Please refresh the page and try again. Your booking data has not been changed by this screen.</p>
          <div className="system-state-actions">
            <button className="luxury-button" type="button" onClick={() => window.location.reload()}>
              Refresh page ↻
            </button>
            <Link className="secondary-button" to="/">Return home</Link>
          </div>
        </section>
      </main>
    );
  }
}

export default ErrorBoundary;
