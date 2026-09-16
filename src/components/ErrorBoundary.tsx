import { Component, type ReactNode } from 'react';
import { logError } from '../lib/errorLog';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    logError(error, 'ErrorBoundary');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className={styles.errorBox}>
          <p className={styles.message}>Ceva n-a mers. Reia aplicația.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reia
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
