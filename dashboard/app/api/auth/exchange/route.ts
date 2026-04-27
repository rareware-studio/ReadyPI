import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/exchange
 *
 * Server-side proxy for Firebase token exchange.
 * The frontend can call this Next.js API route instead of hitting the
 * backend directly, useful for:
 *   - Server-side session management
 *   - Setting HTTP-only cookies
 *   - Keeping the backend URL private from the client
 *
 * Request body: { id_token: string }
 * Proxies to: POST {API_BASE_URL}/auth/firebase-exchange
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_token } = body;

    if (!id_token || typeof id_token !== 'string') {
      return NextResponse.json(
        { error: 'Missing id_token', message: 'Firebase ID token is required' },
        { status: 400 }
      );
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const backendResponse = await fetch(`${API_BASE_URL}/auth/firebase-exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_token }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    // Create response with the backend data
    const response = NextResponse.json(data, { status: 200 });

    // Optionally set an HTTP-only cookie with the JWT for server-side auth
    if (data.token) {
      response.cookies.set('readypi_session', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('[API /auth/exchange] Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
