import React from 'react';

export class DemoErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[DemoPage Error]:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-8 text-center">
                    <h2 className="text-xl font-bold mb-2">Something went wrong rendering this component</h2>
                    <p className="text-neutral-400 text-sm max-w-md mb-4 font-mono">
                        {this.state.error?.message || 'Unknown runtime error occurred.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-brand-blue text-white rounded font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default DemoErrorBoundary;

