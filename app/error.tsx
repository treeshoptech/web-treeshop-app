'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#FFFFFF',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '16px',
            margin: '0 0 16px 0',
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: '#A0A0A0',
            marginBottom: '24px',
            margin: '0 0 24px 0',
            lineHeight: '1.5',
          }}
        >
          We encountered an unexpected error. Please try again, and if the problem
          persists, contact support.
        </p>

        {error.message && (
          <details
            style={{
              marginBottom: '24px',
              padding: '12px',
              backgroundColor: '#1A1A1A',
              borderRadius: '8px',
              border: '1px solid #2A2A2A',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <summary
              style={{
                fontSize: '14px',
                color: '#007AFF',
                fontWeight: '500',
                userSelect: 'none',
              }}
            >
              Error details
            </summary>
            <p
              style={{
                fontSize: '12px',
                color: '#808080',
                marginTop: '8px',
                marginBottom: '0',
                fontFamily: 'monospace',
                wordBreak: 'break-word',
              }}
            >
              {error.message}
            </p>
          </details>
        )}

        <button
          onClick={() => reset()}
          style={{
            backgroundColor: '#007AFF',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0066DD';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#007AFF';
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
