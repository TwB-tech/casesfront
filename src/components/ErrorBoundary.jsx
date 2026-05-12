import React from 'react';
import { Button } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('React Error Boundary caught an error:', error, errorInfo);
    // Optional: send to error reporting service
  }

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#cf1322', background: '#fff2f0', minHeight: '100vh' }}>
          <h2>Something went wrong.</h2>
          <p style={{ marginBottom: 24 }}>
            We apologize for the inconvenience. You can try reloading the page or return to the home page.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button type="primary" icon={<ReloadOutlined />} onClick={this.handleReload}>
              Reload Page
            </Button>
            <Button icon={<HomeOutlined />} onClick={this.handleGoHome}>
              Go to Home
            </Button>
          </div>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: 24, textAlign: 'left', fontSize: '12px', color: '#666' }}>
            <summary>Error details (for debugging)</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
