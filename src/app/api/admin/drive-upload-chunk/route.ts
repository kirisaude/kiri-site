import { NextResponse } from "next/server";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const uploadUrl = request.headers.get("x-upload-url");
  const start = parseInt(request.headers.get("x-upload-start") ?? "0", 10);
  const total = parseInt(request.headers.get("x-upload-total") ?? "0", 10);
  const contentType = request.headers.get("x-file-type") ?? "application/octet-stream";

  if (!uploadUrl || isNaN(total) || total <= 0) {
    return NextResponse.json({ error: "Cabeçalhos obrigatórios ausentes" }, { status: 400 });
  }

  let chunk: ArrayBuffer;
  try {
    chunk = await request.arrayBuffer();
  } catch (e) {
    return NextResponse.json(
      { error: `Erro ao ler dados: ${e instanceof Error ? e.message : e}` },
      { status: 400 }
    );
  }

  const end = start + chunk.byteLength - 1;

  let driveRes: Response;
  try {
    driveRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Content-Type": contentType,
      },
      body: chunk,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Falha ao conectar ao Drive: ${e instanceof Error ? e.message : e}` },
      { status: 502 }
    );
  }

  if (driveRes.status === 200 || driveRes.status === 201) {
    const data = await driveRes.json().catch(() => ({})) as { webViewLink?: string };
    return NextResponse.json({ ok: true, webViewLink: data.webViewLink });
  }

  if (driveRes.status === 308) {
    return NextResponse.json({ ok: true, status: 308 });
  }

  const errText = await driveRes.text().catch(() => "");
  return NextResponse.json(
    { error: `Erro no upload (${driveRes.status})${errText ? ": " + errText.slice(0, 200) : ""}` },
    { status: 502 }
  );
}
