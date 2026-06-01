// Security Middleware for Next.js
// Protects against common attacks

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Blocked user agents (common scraper bots)
const BLOCKED_USER_AGENTS = [
    'httrack',
    'wget',
    'curl',
    'scrapy',
    'python-requests',
    'go-http-client',
    'java/',
    'libwww-perl',
    'apache-httpclient',
    'http.rb',
    'gptbot',
    'chatgpt-user',
    'ccbot',
    'anthropic-ai',
    'claude-web',
];

// Blocked paths - prevent access to sensitive files
const BLOCKED_PATHS = [
    '/.env',
    '/.git',
    '/wp-admin',
    '/wp-login',
    '/phpmyadmin',
    '/admin.php',
    '/.htaccess',
    '/config.php',
    '/xmlrpc.php',
];

function isBlockedUserAgent(userAgent: string | null): boolean {
    if (!userAgent) return false;

    const lowerUA = userAgent.toLowerCase();
    return BLOCKED_USER_AGENTS.some(blocked => lowerUA.includes(blocked));
}

function isBlockedPath(pathname: string): boolean {
    const lowerPath = pathname.toLowerCase();
    return BLOCKED_PATHS.some(blocked => lowerPath.startsWith(blocked));
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const userAgent = request.headers.get('user-agent');

    // Block suspicious paths
    if (isBlockedPath(pathname)) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // Block known scraper bots
    if (isBlockedUserAgent(userAgent)) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // Continue with request
    const response = NextResponse.next();

    // Add security headers (X-Frame-Options removed - it blocks embed player iframe)
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
