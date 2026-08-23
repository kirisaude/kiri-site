import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const base = new URL(request.url).origin;

  if (!code || code.length < 4) return NextResponse.redirect(`${base}/`);

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/followups?token=ilike.${encodeURIComponent(code + "*")}&select=token&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );

  if (!res.ok) return NextResponse.redirect(`${base}/`);
  const rows = await res.json() as { token: string }[];
  if (!rows.length) return NextResponse.redirect(`${base}/`);

  return NextResponse.redirect(`${base}/followup/${rows[0].token}?plataforma=1`, { status: 302 });
}
