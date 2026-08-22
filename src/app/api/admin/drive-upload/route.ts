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

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json({ error: "Drive não configurado" }, { status: 503 });
  }

  const formData = await request.formData();
  const folderId = formData.get("folder_id") as string;
  const file = formData.get("file") as File;

  if (!folderId || !file) {
    return NextResponse.json({ error: "folder_id e file são obrigatórios" }, { status: 400 });
  }

  const accessToken = await getAccessToken();
  const fileBytes = await file.arrayBuffer();

  const boundary = "kiri_boundary_" + Date.now();
  const metadata = JSON.stringify({ name: file.name, parents: [folderId] });

  const metaPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`;
  const filePart = `--${boundary}\r\nContent-Type: ${file.type || "application/octet-stream"}\r\n\r\n`;
  const closing = `\r\n--${boundary}--`;

  const metaBytes = new TextEncoder().encode(metaPart);
  const filePartBytes = new TextEncoder().encode(filePart);
  const closingBytes = new TextEncoder().encode(closing);

  const body = new Uint8Array(
    metaBytes.byteLength + filePartBytes.byteLength + fileBytes.byteLength + closingBytes.byteLength
  );
  let offset = 0;
  body.set(metaBytes, offset); offset += metaBytes.byteLength;
  body.set(filePartBytes, offset); offset += filePartBytes.byteLength;
  body.set(new Uint8Array(fileBytes), offset); offset += fileBytes.byteLength;
  body.set(closingBytes, offset);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.error?.message ?? "Erro ao fazer upload" }, { status: res.status });
  }

  return NextResponse.json({ ok: true, file: data });
}
