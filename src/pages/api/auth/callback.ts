import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Callback received with request:', {
    url: req.url,
    method: req.method,
    query: req.query,
  });

  const code = req.query.code as string;
  if (!code) {
    console.error('No code provided in callback');
    return res.status(400).send("Missing code");
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  console.log('Callback handler using redirect URI:', redirectUri);

  const params = new URLSearchParams({
    code,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  console.log('Token exchange parameters:', {
    redirect_uri: redirectUri,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID ? 'exists' : 'missing',
    client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET ? 'exists' : 'missing',
  });

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  
  const tokens = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error('Token exchange error:', tokens);
    return res.status(400).json({ error: "Failed to get access token", details: tokens });
  }

  console.log('Token exchange successful, getting user info...');
  // Fetch user email
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  
  const user = await userRes.json();
  if (!userRes.ok) {
    console.error('User info error:', user);
    return res.status(400).json({ error: "Failed to get user info", details: user });
  }

  console.log('User info retrieved successfully, redirecting...');
  // Redirect to e-library with token and email in query
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/e-library?google_access_token=${tokens.access_token}&google_email=${encodeURIComponent(user.email)}`;
  console.log('Redirecting to:', redirectUrl);
  res.redirect(redirectUrl);
}
