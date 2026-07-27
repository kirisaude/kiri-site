import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({}, { status: 200 });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/avaliacoes?aprovado=eq.true&select=profissional_id,nota`,
    {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) return NextResponse.json({}, { status: 200 });

  const rows: { profissional_id: string; nota: number }[] = await res.json();

  const map: Record<string, { soma: number; count: number }> = {};
  for (const r of rows) {
    if (!map[r.profissional_id]) map[r.profissional_id] = { soma: 0, count: 0 };
    map[r.profissional_id].soma += r.nota;
    map[r.profissional_id].count += 1;
  }

  const result: Record<string, { media: number; count: number }> = {};
  for (const [id, { soma, count }] of Object.entries(map)) {
    result[id] = { media: Math.round((soma / count) * 10) / 10, count };
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
