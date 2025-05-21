import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("Missing code");

  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback",
    grant_type: "authorization_code",
  });

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const tokens = await tokenRes.json();
  if (!tokens.access_token) {
    return res.status(400).json({ error: "Failed to get access token" });
  }

  // Fetch user email
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const user = await userRes.json();

  // Redirect to dashboard (not e-library) with token and email in query
  const redirectUrl = `/dashboard?google_access_token=${tokens.access_token}&google_email=${encodeURIComponent(user.email)}`;
  res.redirect(redirectUrl);
}
