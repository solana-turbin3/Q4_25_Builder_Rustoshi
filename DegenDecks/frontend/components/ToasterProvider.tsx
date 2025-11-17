'use client';

import { Toaster } from 'react-hot-toast';

export const ToasterProvider = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                // Default options
                duration: 4000,
                style: {
                    background: '#1a1456',
                    color: '#fff',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '16px',
                },
                // Success toast
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                    },
                    style: {
                        border: '1px solid rgba(34, 197, 94, 0.5)',
                    },
                },
                // Error toast
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                    style: {
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                    },
                },
                // Loading toast
                loading: {
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
};
