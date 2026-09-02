import { NextResponse } from "next/server";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? "Erro ao obter token");
  return data.access_token as string;
}

// Retorna uma URL de upload resumível para o Google Drive.
// O browser faz o upload diretamente para o Drive, sem passar pelo Vercel.
export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json({ error: "Drive não configurado" }, { status: 503 });
  }

  const { folder_id, name, mime_type, size } = await request.json() as {
    folder_id: string; name: string; mime_type: string; size: number;
  };
  if (!folder_id || !name) {
    return NextResponse.json({ error: "folder_id e name são obrigatórios" }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (e) {
    return NextResponse.json({ error: `Token Google: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }

  const initRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": mime_type || "application/octet-stream",
        ...(size ? { "X-Upload-Content-Length": String(size) } : {}),
      },
      body: JSON.stringify({ name, parents: [folder_id] }),
    }
  );

  if (!initRes.ok) {
    const err = await initRes.json().catch(() => ({})) as { error?: { message: string } };
    return NextResponse.json({ error: err.error?.message ?? "Erro ao iniciar upload" }, { status: 502 });
  }

  const uploadUrl = initRes.headers.get("Location");
  if (!uploadUrl) {
    return NextResponse.json({ error: "URL de upload não retornada pelo Google" }, { status: 502 });
  }

  return NextResponse.json({ upload_url: uploadUrl });
}
