import { NextResponse } from "next/server";

const TALLY_FORM_ID = "D4bWyE";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const apiKey = process.env.TALLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TALLY_API_KEY não configurada" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.tally.so/forms/${TALLY_FORM_ID}/submissions?page=1&limit=50`,
    { headers: { Authorization: `Bearer ${apiKey}` }, next: { revalidate: 0 } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao buscar respostas do Tally" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
