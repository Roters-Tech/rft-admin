import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('rft_role')?.value;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!role && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (role && pathname === '/login') {
    const redirectMap: Record<string, string> = {
      super_admin: '/dashboard/super',
      school_admin: '/dashboard/school',
      lecturer: '/dashboard/lecturer',
    };

    return NextResponse.redirect(new URL(redirectMap[role] ?? '/dashboard/super', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
