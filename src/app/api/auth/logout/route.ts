import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    // Clear the JWT token cookie with same settings as login
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = isProduction ? '.freejobai.com' : undefined;
    
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
      domain: domain,
    });

    return response;
  } catch (error: unknown) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
