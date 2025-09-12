
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This list should contain all your top-level static files and folders.
export const PUBLIC_FILE = /\.(.*)$/

// Define your main app domain. We will use an environment variable for this.
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host')
  
  if (!hostname) {
    return new Response(null, { status: 400, statusText: 'No hostname found in request headers' });
  }

  // Prevent middleware from running on static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Get the subdomain from the hostname
  const currentHost = hostname.replace(`.${APP_DOMAIN}`, '').replace(`.${process.env.NEXT_PUBLIC_VERCEL_URL}`, '');

  // If there's a subdomain and it's not 'www' or the root domain, rewrite to the /subdomain route
  if (currentHost !== APP_DOMAIN && currentHost !== 'www') {
    console.log(`Rewriting for subdomain: ${currentHost}`);
    url.pathname = `/_subdomain/${currentHost}${pathname}`
    return NextResponse.rewrite(url)
  }

  // Allow requests to the root domain to pass through
  return NextResponse.next()
}
