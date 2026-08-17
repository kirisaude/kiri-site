import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token || !supabaseUrl || !supabaseKey) {
    return NextResponse.redirect("https://kirisaude.com.br/pro/entrar?erro=link_invalido");
  }

  // Busca token no Supabase
  const res = await fetch(
    `${supabaseUrl}/rest/v1/pro_auth_tokens?token=eq.${token}&select=id,inscricao_id,expira_em,usado`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
  );
  const [registro] = await res.json() as Array<{
    id: string; inscricao_id: string; expira_em: string; usado: boolean;
  }>;

  if (!registro || registro.usado || new Date(registro.expira_em) < new Date()) {
    return NextResponse.redirect("https://kirisaude.com.br/pro/entrar?erro=link_expirado");
  }

  // Marca token como usado
  await fetch(`${supabaseUrl}/rest/v1/pro_auth_tokens?id=eq.${registro.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ usado: true }),
  });

  // Define cookie com inscricao_id e redireciona para o dashboard
  const response = NextResponse.redirect("https://kirisaude.com.br/pro/dashboard");
  response.cookies.set("kiri_pro_id", registro.inscricao_id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return response;
}
