"use client";

import { useEffect } from 'react';

export function PWAInstaller() {
    useEffect(() => {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/',
                    });
                    console.log('SW registered:', registration.scope);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New service worker available, show update prompt
                                    if (confirm('Có phiên bản mới! Tải lại trang?')) {
                                        window.location.reload();
                                    }
                                }
                            });
                        }
                    });
                } catch (error) {
                    console.error('SW registration failed:', error);
                }
            });
        }

        // PWA Install Prompt
        let deferredPrompt: any;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show custom install button (optional)
            console.log('PWA install available');
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            deferredPrompt = null;
        });
    }, []);

    return null;
}

export function PerformanceMonitor() {
    useEffect(() => {
        // Web Vitals monitoring
        if (typeof window !== 'undefined') {
            import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
                onCLS(console.log);
                onINP(console.log);
                onFCP(console.log);
                onLCP(console.log);
                onTTFB(console.log);
            });
        }

        // Performance Observer for monitoring
        if ('PerformanceObserver' in window) {
            try {
                // Long Tasks
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.log('Long task detected:', entry);
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });

                // Layout Shifts
                const observer2 = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!(entry as any).hadRecentInput) {
                            console.log('Layout shift:', entry);
                        }
                    }
                });
                observer2.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                // Ignore if not supported
            }
        }
    }, []);

    return null;
}
