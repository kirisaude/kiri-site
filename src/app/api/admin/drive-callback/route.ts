import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:2rem"><h2>❌ Erro: ${error}</h2></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:2rem"><h2>❌ Código não recebido</h2></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = "https://kiri-site.vercel.app/api/admin/drive-callback";

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:2rem"><h2>❌ Erro ao trocar código</h2><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const refreshToken = data.refresh_token;

  if (!refreshToken) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:2rem">
        <h2>⚠️ Refresh token não recebido</h2>
        <p>Tente revogar o acesso em <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a> e autorize novamente.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Drive autorizado — Kiri</title></head>
    <body style="font-family:sans-serif;padding:2rem;max-width:600px;margin:0 auto">
      <h2 style="color:#44606C">✅ Drive autorizado com sucesso!</h2>
      <p>Copie o token abaixo e adicione no Vercel como variável de ambiente <code style="background:#f0f0f0;padding:2px 6px;border-radius:4px">GOOGLE_REFRESH_TOKEN</code>:</p>
      <textarea
        onclick="this.select()"
        style="width:100%;height:90px;font-family:monospace;font-size:12px;padding:8px;border:1px solid #ccc;border-radius:6px;resize:none"
        readonly>${refreshToken}</textarea>
      <p style="margin-top:1rem">
        <strong>Próximos passos:</strong><br>
        1. Copie o token acima<br>
        2. Vá em <a href="https://vercel.com">vercel.com</a> → projeto → Settings → Environment Variables<br>
        3. Adicione <code>GOOGLE_REFRESH_TOKEN</code> com o valor copiado<br>
        4. Faça redeploy do projeto
      </p>
    </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
