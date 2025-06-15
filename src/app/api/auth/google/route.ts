import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    console.error('No code provided in callback');
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    console.log('Exchanging code for token...');
    // Exchange the code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenData);
      return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 500 });
    }

    console.log('Token exchange successful, getting user info...');
    // Get user email
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('User info error:', userData);
      return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 });
    }

    console.log('User info retrieved successfully, redirecting...');
    // Redirect back to the e-library page with the tokens
    const redirectUrl = new URL('/dashboard/e-library', process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set('google_access_token', tokenData.access_token);
    redirectUrl.searchParams.set('google_email', userData.email);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 